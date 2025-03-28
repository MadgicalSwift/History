import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localised } from 'src/i18n/en/localised-strings';
import data from '../datasource/NewData.json';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { plainToClass } from 'class-transformer';
import { User } from 'src/model/user.entity';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';



@Injectable()
export class ChatbotService {
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private botId = process.env.BOT_ID;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatMessageService: SwiftchatMessageService;
  private readonly topics: any[] = data.classes;
  private readonly mixpanel: MixpanelService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatMessageService: SwiftchatMessageService,
    mixpanel: MixpanelService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.swiftchatMessageService = swiftchatMessageService;
    this.userService = userService;
    this.mixpanel = mixpanel;
  }

  public async processMessage(body: any): Promise<any> {
    // Destructure 'from', 'text', and 'button_response' from the body
    const { from, text, button_response, persistent_menu_response } = body;

    // Retrieve botID from environment variables
    const botID = process.env.BOT_ID;
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    // If no user data is found, create a new user
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
      userData = await this.userService.findUserByMobileNumber(from, botID);
    }

    // Convert plain user data to a User class instance
    const user = plainToClass(User, userData);

    // console.log('Start User:=>', user);

    //  Persistent Menu Response Handling
    if (persistent_menu_response) {
      

      if (persistent_menu_response.body == 'Class Selection') {

        await this.resetQuizData(user);
        await this.message.sendInitialClasses(from);
        // console.log('Class Selection User:=>', user);
        
        return 'ok';
      }
      else if (persistent_menu_response.body == 'Topic Selection') {
        user.selectedSet = null;
        user.questionsAnswered = 0;
        user.score = 0;
        user.descriptionIndex = 0;
        user.selectedSubtopic = null;
        user.selectedSubtopicName = null;
        await this.userService.saveUser(user);
        const topic = this.topics.find((t) => t.class === user.selectedMainTopic);
        if (topic) {
          await this.message.sendSubTopics(from, topic.class);
          // console.log('Topic Selection User:=>', user);
          
        } else {
          console.error('Error: Selected topic not found.');
        }
      }

      return 'ok';
    }

    // Handle button response from the user
    if (button_response) {
      const buttonBody = button_response.body;

      // Mixpanel tracking data
      const trackingData = {
        distinct_id: from,
        button: buttonBody,
        botID: botID,
      };

      this.mixpanel.track('Button_Click', trackingData);

      // Handle 'Main Menu' button - reset user quiz data and send welcome message

      if (buttonBody === localised.mainMenu) {
        user.descriptionIndex = 0;
        user.questionsAnswered = 0;
        user.score = 0;
        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.selectedSubtopicName = null;
        await this.userService.saveUser(user);
        await this.message.sendWelcomeMessage(from, user.language);
        await this.message.sendInitialClasses(from);

        // console.log('Main Menu User:=>', user);
        
        return 'ok';
      };

      // Handle 'Retake Quiz' button - reset quiz progress and send the first question
      if (buttonBody === localised.retakeQuiz) {
        user.questionsAnswered = 0;
        user.score = 0;
        await this.userService.saveUser(user);
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const randomSet = user.selectedSet;
        const selectedSubtopicName = user.selectedSubtopicName;
        await this.message.getQuestionBySet(from, buttonBody, selectedMainTopic, selectedSubtopic, randomSet, user.questionsAnswered, selectedSubtopicName);
        // console.log('Retake Quiz User:=>', user);
        
        return 'ok';
      }


      if (buttonBody === localised.viewChallenge) {
        await this.handleViewChallenges(from, userData);
        // await this.message.endMessage(from);
        user.descriptionIndex = 0;
        user.questionsAnswered = 0;
        user.score = 0;
        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.selectedSubtopicName = null;
        await this.userService.saveUser(user);
        // await this.message.sendWelcomeMessage(from, user.language);
        await this.message.sendInitialClasses(from);
        return 'ok';
      }


      // Handle 'More Explanation' button - send complete explanation for the subtopic

      if (buttonBody === localised.Moreexplanation) {


        const topic = this.topics.find(topic => topic.class === user.selectedMainTopic);
        const subTopic = topic.topics.find(topic => topic.topicName === user.selectedSubtopic);
        const subtopicNameArr = subTopic.subtopics.find((subtopic) => subtopic.subtopicName === user.selectedSubtopicName);

        if (subtopicNameArr) {

          const descriptions = subtopicNameArr.description;
          let description = descriptions[user.descriptionIndex].content
          let title = descriptions[user.descriptionIndex].title

          // const subtopicName = subtopicNameArr.subtopicName;

          if ((descriptions.length - 1) == user.descriptionIndex) {


            await this.message.sendCompleteExplanation(from, description, title);

            // console.log('Complete Explanation User:=>', user);
          }
          else {

            await this.message.sendExplanation(from, description, title);
            user.descriptionIndex += 1;
            await this.userService.saveUser(user);

            // console.log('More Explanation User:=>', user);
          }
        }
        return 'ok';
      }


      // Handle 'Test Yourself' button - show difficulty options to the user

      if (buttonBody === localised.testYourself) {

        user.questionsAnswered = 0;
        user.score = 0;
        await this.userService.saveUser(user);

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const selectedSubtopicName = user.selectedSubtopicName;
        const currentQuestionIndex = user.questionsAnswered;

        const { randomSet } = await this.message.sendQuestion(from, selectedMainTopic, selectedSubtopic, selectedSubtopicName, currentQuestionIndex);

        user.selectedSet = randomSet;

        await this.userService.saveUser(user);

        // console.log('Test Yourself User:=>', user);
        

        return 'ok';
      }

      // Handle quiz answer submission - check if the user is answering a quiz question
      if (user.selectedSet) {
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const randomSet = user.selectedSet;
        const currentQuestionIndex = user.questionsAnswered;
        const selectedSubtopicName = user.selectedSubtopicName;
        const { result } = await this.message.checkAnswer(from, buttonBody, selectedMainTopic, selectedSubtopic, randomSet, currentQuestionIndex, selectedSubtopicName);

        // Update user score and questions answered
        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);

        // console.log('Quiz Answer User:=>', user);
        


        // If the user has answered 10 questions, send their final score
        if (user.questionsAnswered >= 10) {

          let badge = '';
          if (user.score === 10) {
            badge = 'Gold 🥇';
          } else if (user.score >= 7) {
            badge = 'Silver 🥈';
          } else if (user.score >= 5) {
            badge = 'Bronze 🥉';
          } else {
            badge = 'No';
          }

          // Store the data to be stored in database
          const challengeData = {
            topic: selectedMainTopic,
            subTopic: selectedSubtopic,
            question: [
              {
                setNumber: randomSet,
                score: user.score,
                badge: badge,
              },
            ],
          };
          // Save the challenge data into the database
          await this.userService.saveUserChallenge(
            from,
            userData.Botid,
            challengeData,
          );

          await this.message.newscorecard(from, user.score, user.questionsAnswered, badge)

          return 'ok';
        }
        // Send the next quiz question
        await this.message.getQuestionBySet(from, buttonBody, selectedMainTopic, selectedSubtopic, randomSet, user.questionsAnswered, selectedSubtopicName);
        return 'ok';
      }

      // Handle topic selection - find the main topic and save it to the user data

      const topic = this.topics.find((topic) => topic.class === buttonBody);

      if (topic) {
        const mainTopic = topic.class;

        if (user.selectedMainTopic !== mainTopic) {
          user.selectedMainTopic = mainTopic;
          await this.userService.saveUser(user);
        }

        await this.message.sendSubTopics(from, mainTopic);

        // console.log('Topic Selection User:=>', user);
        
        return 'ok';
      }
      else {

        const topic = this.topics.find(topic => topic.class === user.selectedMainTopic);
        // console.log('Topic Selection 1:=>', topic);
        const mainTopic = topic.class;
        
        const subTopic = topic.topics.find(topic => (topic.topicName === buttonBody || topic.topicName === user.selectedSubtopic));
        const subtopic = subTopic.topicName

        // console.log('Topic Selection 2:=>', mainTopic, subtopic);
        

        if (subTopic && user.selectedSubtopic == null) {
          const subtopic = subTopic.topicName

          // console.log('Topic Selection 3:=>', subtopic);
          

          if (user.selectedSubtopic !== subtopic) {
            user.selectedSubtopic = subtopic;
            await this.userService.saveUser(user);
          }

          // console.log('Topic Selection User:=>', user);
          

          await this.message.sendSubTopics2(from, mainTopic, subtopic);

          // console.log('Subtopic Selection User:=>', user);

          return 'ok';

        }
        else {

          // console.log("hello vishal");
          

          const topic = this.topics.find(topic => topic.class === user.selectedMainTopic);
          const subTopic = topic.topics.find(topic => topic.topicName === user.selectedSubtopic);

          const subtopicName = subTopic.subtopics.find((subtopic) => subtopic.subtopicName === buttonBody);


          if (subtopicName) {


            const subTopicName = subtopicName.subtopicName;

            const description = subtopicName.description[0].content;
            let title = subtopicName.description[0].title

            if (user.selectedSubtopicName !== subTopicName) {
              user.selectedSubtopicName = subTopicName;
              await this.userService.saveUser(user);
            }


            await this.message.sendExplanation(from, description, title);
            user.descriptionIndex += 1;
            await this.userService.saveUser(user);
            // console.log('Subtopic Name Selection User:=>', user);
            
            return 'ok';
          }

        }


      }

      return 'ok';
    }

    // Handle text message input - reset user data and send a welcome message
    else {

      if (localised.validText.includes(text.body)) {
        const userData = await this.userService.findUserByMobileNumber(
          from,
          botID,
        );
        if (!userData) {
          await this.userService.createUser(from, 'English', botID);
        }
        user.selectedSet = null;
        user.selectedMainTopic = null;
        user.selectedSubtopic = null;
        user.selectedSubtopicName = null;
        user.score = 0;
        user.questionsAnswered = 0;
        user.descriptionIndex = 0;
        await this.userService.saveUser(user);
        if (userData.name == null) {
          await this.message.sendWelcomeMessage(from, user.language);
          await this.message.sendName(from);
          // console.log("sendName User =>", user);

          return 'ok';
          
        }
        else {
          await this.message.sendWelcomeMessage(from, user.language);
          await this.message.sendInitialClasses(from);

          // console.log("sendInitialClasses-1 User => ", user);

          return 'ok';
          
        }
      }
      else {

        await this.userService.saveUserName(from, botID, text.body);
        await this.message.sendInitialClasses(from);

        // console.log("sendInitialClasses-2 User =>", user);

        return 'ok';
        
      }

    }
  }


  private async resetQuizData(user: User): Promise<void> {

    user.selectedSet = null;
    user.questionsAnswered = 0;
    user.score = 0;
    user.descriptionIndex = 0;
    user.selectedSubtopic = null;
    user.selectedSubtopicName = null;
    user.selectedMainTopic = null;
    await this.userService.saveUser(user);
  }


  async handleViewChallenges(from: string, userData: any): Promise<void> {
    try {

      const topStudents = await this.userService.getTopStudents(
        userData.Botid,
        userData.selectedMainTopic,
        userData.selectedSet,
        userData.selectedSubtopic,
        userData.selectedSubtopicName,
      );
      if (topStudents.length === 0) {

        await this.swiftchatMessageService.sendMessage(this.baseUrl, {
          to: from,
          type: 'text',
          text: { body: 'No challenges have been completed yet.' },
        }, this.apiKey);
        return;
      }
      // Format the response message with the top 3 students
      let message = 'Top 3 Users:\n\n';
      topStudents.forEach((student, index) => {
        const totalScore = student.score || 0;
        const studentName = student.name || 'Unknown';

        let badge = '';
        if (totalScore === 10) {
          badge = 'Gold 🥇';
        } else if (totalScore >= 7) {
          badge = 'Silver 🥈';
        } else if (totalScore >= 5) {
          badge = 'Bronze 🥉';
        } else {
          badge = 'No';
        }

        message += `${index + 1}. ${studentName}\n`;
        message += `    Score: ${totalScore}\n`;
        message += `    Badge: ${badge}\n\n`;
      });

      // Send the message with the top students' names, scores, and badges
      await this.swiftchatMessageService.sendMessage(this.baseUrl, {
        to: from,
        type: 'text',
        text: { body: message },
      }, this.apiKey);
    } catch (error) {
      console.error('Error handling View Challenges:', error);
      await this.swiftchatMessageService.sendMessage(this.baseUrl, {
        to: from,
        type: 'text',
        text: {
          body: 'An error occurred while fetching challenges. Please try again later.',
        },
      }, this.apiKey);
    }
  }

}
export default ChatbotService;


