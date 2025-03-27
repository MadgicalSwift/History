import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localised } from 'src/i18n/en/localised-strings';

import {
  createMainTopicButtons,
  createSubTopicButtons,
  createSubTopicButtons2,
  createButtonWithExplanation,
  createDifficultyButtons,
  createTestYourSelfButton,
  questionButton,
  answerFeedback,
  optionButton,
  buttonWithScore
} from 'src/i18n/buttons/button';
import axios from 'axios';
dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }

  async sendWelcomeMessage(from: string, language: string) {
    
    const message= localised.welcomeMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async endMessage(from: string) {
    
    const message= localised.endMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async sendInitialClasses(from:string){
    const messageData = createMainTopicButtons(from);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  async sendName(from:string){
    const message= "Can you please tell me your name?";
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendSubTopics(from: string, topicName: string) {
    
    const messageData = createSubTopicButtons(from, topicName);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async sendSubTopics2(from: string, topicName: string) {
    
    const messageData = createSubTopicButtons2(from, topicName);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async difficultyButtons(from: string) {
    const messageData = createDifficultyButtons(from);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    selectedDifficulty: string,
    selectedSubtopicName: string,
    currentQuestionIndex: number,
  ) {
    const { messageData, randomSet } = await questionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      selectedDifficulty,
      selectedSubtopicName,
      currentQuestionIndex,
      
    );
    if (!messageData) {
      return;
    }
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }

  async sendExplanation(from: string,description: string,subtopicName: string) {
    const messageData = createButtonWithExplanation(from,description,subtopicName);
    const response = await this.sendMessage(this.baseUrl,messageData,this.apiKey);
    return response;
  }

  async sendCompleteExplanation(from: string, description: string, subtopicName: string) {
    const messageData = createTestYourSelfButton(from, description, subtopicName);
    const response = await this.sendMessage(this.baseUrl, messageData,this.apiKey);
    return response;
  }



  async checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    selectedDifficulty: string,
    randomSet: string,
    currentQuestionIndex: number,
    selectedSubtopicName: string,
  ) {
    const { feedbackMessage, result } = answerFeedback(
      from,
      answer,
      selectedMainTopic,
      selectedSubtopic,
      selectedDifficulty,
      randomSet,
      currentQuestionIndex,
      selectedSubtopicName,
    );

    const requestData = this.prepareRequestData(from, feedbackMessage);
    try {
      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      return { response, result };
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    selectedDifficulty: string,
    randomSet: string,
    currentQuestionIndex: number,
    selectedSubtopicName: string,
  ) {
    const messageData = optionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      selectedDifficulty,
      randomSet,
      currentQuestionIndex,
      selectedSubtopicName,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }



  
  async newscorecard(from: string, score: number, totalQuestions: number, badge: string) {
    let backgroundColor = "teal";
    if (score >= 9) backgroundColor = "orange";
    else if (score >= 7) backgroundColor = "blue";
    else if (score >= 5) backgroundColor = "green";
    else if (score >= 3) backgroundColor = "pink";
    
    let shareMessage = "Keep going! You got this!";
    if (score >= 9) shareMessage = "Outstanding! Keep shining!";
    else if (score >= 7) shareMessage = "Great work! Keep improving!";
    else if (score >= 5) shareMessage = "Good effort! Keep practicing!";
    else if (score >= 3) shareMessage = "Nice try! You’re learning!";
    
    const performanceScore = `${(score / totalQuestions) * 100}%`;
    
    const payload = {
        to: from,
        type: "scorecard",
        scorecard: {
            theme: "theme2",
            background: backgroundColor,
            performance: "high",
            share_message: shareMessage,
            text1: `Quiz-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear() % 100}`,
            text2: shareMessage,
            text3: performanceScore,
            text4: `${badge} `,
            score: `${score}/${totalQuestions}`,
            animation: "confetti"
        }
    };
    
    const response = await axios.post(this.baseUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const messageData = buttonWithScore(from, score, totalQuestions, badge);
    await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    
    return response;
}



  
  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.select_language,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
}
