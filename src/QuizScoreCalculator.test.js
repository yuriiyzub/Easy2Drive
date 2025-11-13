const QuizScoreCalculator = require('./QuizScoreCalculator');
describe('QuizScoreCalculator', () => {
    test('Тест-кейс 1: Розрахунок відсотка для ідеального результату(20 / 20)', () => {
        const percentage = QuizScoreCalculator.calculatePercentage(20, 20);
        expect(percentage).toBe(100);
        const fullResult = QuizScoreCalculator.getFullResult(20, 20);
        expect(fullResult).toEqual({
            correctAnswers: 20,
            incorrectAnswers: 0,
            totalQuestions: 20,
            percentage: 100,
            passed: true,
            grade: "Відмінно"
        });
    });
    test('Тест-кейс 2: Розрахунок відсотка для часткового результату(7 / 10)', () => {
        const percentage = QuizScoreCalculator.calculatePercentage(7, 10);
        expect(percentage).toBe(70);
        const passed = QuizScoreCalculator.isPassed(70);
        expect(passed).toBe(false);
        const grade = QuizScoreCalculator.getGrade(70);
        expect(grade).toBe("Задовільно");
    });
    test('Тест-кейс 3: Валідація помилкових вхідних даних', () => {
        expect(() => {
            QuizScoreCalculator.calculatePercentage(15, 10);
        }).toThrow("Correct answers cannot exceed total questions");
        expect(() => {
            QuizScoreCalculator.calculatePercentage(-5, 10);
        }).toThrow("Values cannot be negative");
        expect(() => {
            QuizScoreCalculator.calculatePercentage(5, 0);
        }).toThrow("Total questions cannot be zero");
    });
});
