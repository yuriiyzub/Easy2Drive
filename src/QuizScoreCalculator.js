class QuizScoreCalculator {
    /**
     * Розраховує відсоток правильних відповідей
     * @param {number} correctAnswers - кількість правильних відповідей
     * @param {number} totalQuestions - загальна кількість питань
     * @returns {number} - відсоток (0-100)
     */
    static calculatePercentage(correctAnswers, totalQuestions) {
        if (totalQuestions === 0) {
            throw new Error("Total questions cannot be zero");
        }
        if (correctAnswers < 0 || totalQuestions < 0) {
            throw new Error("Values cannot be negative");
        }
        if (correctAnswers > totalQuestions) {
            throw new Error("Correct answers cannot exceed total questions");
        }

        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    /**
     * Визначає чи користувач склав тест (потрібно >= 75% для складання)
     * @param {number} percentage - відсоток правильних відповідей
     * @returns {boolean} - true якщо тест складено
     */
    static isPassed(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        return percentage >= 75;
    }

    /**
     * Отримує текстову оцінку результату
     * @param {number} percentage - відсоток правильних відповідей
     * @returns {string} - текстова оцінка
     */
    static getGrade(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }

        if (percentage >= 90) return "Відмінно";
        if (percentage >= 75) return "Добре";
        if (percentage >= 60) return "Задовільно";
        return "Незадовільно";
    }

    /**
     * Отримує повну інформацію про результат тесту
     * @param {number} correctAnswers - кількість правильних відповідей
     * @param {number} totalQuestions - загальна кількість питань
     * @returns {Object} - об'єкт з детальними результатами
     */
    static getFullResult(correctAnswers, totalQuestions) {
        const percentage = this.calculatePercentage(correctAnswers, totalQuestions);
        const passed = this.isPassed(percentage);
        const grade = this.getGrade(percentage);
        const incorrectAnswers = totalQuestions - correctAnswers;

        return {
            correctAnswers,
            incorrectAnswers,
            totalQuestions,
            percentage,
            passed,
            grade
        };
    }
}

module.exports = QuizScoreCalculator;