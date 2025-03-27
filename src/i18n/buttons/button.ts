// import data from '../../datasource/data.json';
import { User } from 'src/model/user.entity';
import data from '../../datasource/NewData.json';
import { localised } from '../en/localised-strings';
import _ from 'lodash';

export function createMainTopicButtons(from: string) {
  const topics = data.classes.map((topic) => topic.class);

  const buttons = topics.map((topicName) => ({
    type: 'solid',
    body: topicName,
    reply: topicName,
  }));

  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localised.chooseTopic,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}

export function createSubTopicButtons(from: string, topicName: string) {
  const topic = data.classes.find((topic) => topic.class === topicName);

  if (topic && topic.topics) {
    const buttons = topic.topics.map((subtopic) => ({
      type: 'solid',
      body: subtopic.topicName,
      reply: subtopic.topicName,
    }));

    return {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.selectSubtopic(topicName),
          },
        },
        buttons: buttons,
        allow_custom_response: false,
      },
    };
  } else {

    return null;
  }
}

export function createSubTopicButtons2(from: string, topicName: string) {
  const topic = data.classes.find((topic) => topic.class !== topicName);
  const matchingTopic = topic.topics.find(topic => topic.topicName === topicName);
  if (topic && topic.topics) {
    const buttons = matchingTopic.subtopics.map((subtopic) => ({
      type: 'solid',
      body: subtopic.subtopicName,
      reply: subtopic.subtopicName,
    }));

    return {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.selectSubtopic(topicName),
          },
        },
        buttons: buttons,
        allow_custom_response: false,
      },
    };
  } else {

    return null;
  }
}


export function createButtonWithExplanation(from: string, description: string, subtopicName: string) {
  const buttons = [
    {
      type: 'solid',
      body: localised.Moreexplanation,
      reply: localised.Moreexplanation,
    },
    {
      type: 'solid',
      body: localised.testYourself,
      reply: localised.testYourself,
    },
  ];
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localised.explanation(subtopicName, description),
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}



export function createTestYourSelfButton(from: string, description: string, subtopicName: string) {
  const buttons = [
    {
      type: 'solid',
      body: localised.testYourself,
      reply: localised.testYourself,
    },
  ];
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localised.explanation(subtopicName, description)
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}


export function createDifficultyButtons(from: string) {
  const buttons = [
    {
      type: 'solid',
      body: 'Easy',
      reply: 'Easy',
    },
    {
      type: 'solid',
      body: 'Medium',
      reply: 'Medium',
    },
    {
      type: 'solid',
      body: 'Hard',
      reply: 'Hard',
    },
  ];
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localised.difficulty,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}//not used

export function questionButton(from: string, selectedMainTopic: string, selectedSubtopic: string, selectedDifficulty: string, selectedSubtopicName: string) {
  const topic = data.classes.find(
    (topic) => topic.class === selectedMainTopic,
  );

  // console.log("questionButton -> topic", topic);


  if (!topic) {

  }

  const subtopic = topic.topics.find(
    (subtopic) => subtopic.topicName == selectedSubtopic,
  );

  // console.log("questionButton -> subtopic", subtopic);

  if (!subtopic) {

  }


  const subtopicName = subtopic.subtopics.find((subtopic) => subtopic.subtopicName === selectedSubtopicName);
  //  console.log("questionButton -> subtopicName", subtopicName);

  // const questionSets = [1,2,3]
  // const questionSets = subtopic.subtopicName.questionSets.filter((set) => set.level ===selectedDifficulty);


  const questionSets = subtopicName.questionSets
  // console.log("questionButton -> questionSets", questionSets);

  // if (questionSets.length === 0) {
  // questionSets
  //   return;
  // }

  // Randomly select a question set based on difficulty level
  const questionSet = _.sample(questionSets);
  if (!questionSet) {

    return;
  }

  // console.log("questionButton -> questionSet", questionSet);


  const randomSet = questionSet.setNumber;
  const question = questionSet.questions[0];

  const shuffledOptions = _.shuffle(question.options);
  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));

  const messageData = {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: `Question. ${question.question}`,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };

  return { messageData, randomSet };
}

export function answerFeedback(
  from: string,
  answer: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  selectedDifficulty: string,
  randomSet: string,
  currentQuestionIndex: number,
  selectedSubtopicName: string,
) {
  const topic = data.classes.find((t) => t.class === selectedMainTopic);
  // console.log("answerFeedback -> topic", topic);

  if (!topic) {

  }

  const subtopic = topic.topics.find(
    (st) => st.topicName === selectedSubtopic,
  );
  // console.log("answerFeedback -> subtopic", subtopic);

  if (!subtopic) {

  }

  // Find the question set by its level and set number

  const subtopicName = subtopic.subtopics.find((subtopic) => subtopic.subtopicName === selectedSubtopicName);
  //  console.log("answerFeedback -> subtopicName", subtopicName);


  const questionSets = subtopicName.questionSets
  //  console.log("answerFeedback -> questionSets", questionSets);



  const questionSet = questionSets.find(
    (qs) =>
      qs.setNumber === parseInt(randomSet),
  );


  // const questionSet = subtopic.questionSets.find(
  //   (qs) =>
  //     qs.level === selectedDifficulty && qs.setNumber === parseInt(randomSet),
  // );


  // console.log("answerFeedback -> questionSet", questionSet);



  if (!questionSet) {

  }

  const question = questionSet.questions[currentQuestionIndex];



  const explanation = question.explanation;
  if (!explanation) {

  }

  if (!question.answer) {

  }
  const correctAnswer = question.answer;
  const userAnswer = Array.isArray(answer) ? answer[0] : answer;
  const correctAns = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;

  const isCorrect = userAnswer === correctAns;
  const feedbackMessage =
    isCorrect
      ? localised.rightAnswer(explanation)
      : localised.wrongAnswer(correctAns, explanation);
  const result = isCorrect ? 1 : 0;

  return { feedbackMessage, result };
}

export function buttonWithScore(from: string, score: number, totalQuestions: number, badge: string) {
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: localised.score(score, totalQuestions, badge),
        },
      },
      buttons: [
        {
          type: 'solid',
          body: 'Main Menu',
          reply: 'Main Menu',
        },
        {
          type: 'solid',
          body: 'Retake Quiz',
          reply: 'Retake Quiz',
        },
        {
          type: 'solid',
          body: 'View Challenges',
          reply: 'View Challenges',
        }
      ],
      allow_custom_response: false,
    },
  };
}




export function optionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  selectedDifficulty: string,
  randomSet: string,
  currentQuestionIndex: number,
  selectedSubtopicName: string,
) {
  // Find the selected topic

  const topic = data.classes.find((t) => t.class === selectedMainTopic);
  if (!topic) {


    return;
  }

  // Find the selected subtopic
  const subtopic = topic.topics.find(
    (subtopic) => subtopic.topicName === selectedSubtopic,
  );

  if (!subtopic) {


    return;
  }

  const subtopicName = subtopic.subtopics.find((subtopic) => subtopic.subtopicName === selectedSubtopicName);


  const questionSets = subtopicName.questionSets

  const questionSet = questionSets.find(
    (set) =>
      set.setNumber === parseInt(randomSet),
  );

  // console.log("optionButton -> questionSet", questionSet);

  if (!questionSet) {

    return;
  }

  // Check if the current question index is valid
  if (
    currentQuestionIndex < 0 ||
    currentQuestionIndex >= questionSet.questions.length
  ) {

    return;
  }

  // Retrieve the question at the current index
  const question = questionSet.questions[currentQuestionIndex];
  const shuffledOptions = _.shuffle(question.options);

  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));
  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: 'text',
        text: {
          body: `Question. ${question.question}`,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}