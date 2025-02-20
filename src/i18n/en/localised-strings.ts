export const localised = {
  seeMoreMessage: 'See More Data',
  language_hindi: 'हिन्दी',
  language_english: 'English',
  language_changed: 'Language changed to English',
  welcomeMessage: `😊*Welcome to the Indian Medieval History Chatbot!* 🏰\n🔎 Explore the history of India by selecting a 📖 topic from the list below.`,
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  selectSubtopic: (topicName: string) =>
  `📜 Please select a topic for *${topicName}*:`,
  mainMenu:'Main Menu',
  chooseTopic:"What do you like to explore today? Please select a topic to get started!!",
  retakeQuiz:'Retake Quiz',
  testYourself: 'Test Yourself',
  Moreexplanation:'More Explanation',
  viewChallenge:"View Challenges",
  endMessage:"Whenever you're ready to continue, just type 'Hi' to start the bot again. Looking forward to helping you out! 😊",
  explanation: (subtopicName: string, description: string) =>
  `📖 *Explanation of ${subtopicName}:*\n${description}`,
  moreExplanation: (subtopicName: string, description: string) =>
  `📝 More Explanation of *${subtopicName}:*\n*${description}*`,
  difficulty: `🎯 Choose your quiz level to get started!🚀`,
  rightAnswer: (explanation: string) =>
  `🌟 Fantastic! You got it 👍right!\nCheck this out: *${explanation}*`,
  wrongAnswer: (correctAnswer: string, explanation: string) =>
 `👎Not quite right, but you’re learning! 💪\nThe correct answer is: *${correctAnswer}*\nHere’s the explanation: *${explanation}*`,
  score: (score: number, totalQuestions: number, badge: string) => {
    if (badge.toLowerCase() === "no") {
      return `🌟 Great effort! Your score is *${score}* out of *${totalQuestions}*.\n\nKeep trying! You can earn a badge next time! 💪`;
    } else if (badge.toLowerCase() === "bronze 🥉") {
      return `🥉 Good job! Your score is *${score}* out of *${totalQuestions}*.\n\n👏 You earned a *${badge}* badge! Keep improving!`;
    } else if (badge.toLowerCase() === "silver 🥈") {
      return `🥈 Well done! Your score is *${score}* out of *${totalQuestions}*.\n\n🎉 You earned a *${badge}* badge! You're getting better!`;
    } else if (badge.toLowerCase() === "gold 🥇") {
      return `🥇 Amazing! Your score is *${score}* out of *${totalQuestions}*.\n\n🏆 You earned a *${badge}* badge! Keep up the great work!`;
    }
    return `🌟 Great job! Your score is *${score}* out of *${totalQuestions}*.\n\n💪 Congratulations! You earned the *${badge}* badge!`;
  },
    
  
};
