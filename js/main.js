class Game {
    // Таблица игрового счёта, где ключ - номер фрейма, а значение - объект с полями:
    // frame - номер фрейма
    // result - результаты бросков во фрейме
    // frameScore - общий счёт фрейма
    // totalScore - общий счёт на момент фрейма
    gameScoreTable;
    // Массив, который хранит в себе ключи фреймов, в которых был strike/spear и которым требуется обновить значения 
    // frameScore и totalScore в зависимости от дальнейших бросков. Предназначена исключительно для метода updateFrameAndTotalScore()
    pointsAccuralQueue;
    // Номер текущего фрейма. Используется исключительно методом throwDistribution()
    currentFrame;
    constructor() {
        this.gameScoreTable = new Map();
        this.pointsAccuralQueue = [];
        this.currentFrame = 0;
    }
    getCurrentTotalScore() {
        if (this.gameScoreTable.size <= 0) {
            return 0;
        }
        return this.gameScoreTable.get(this.gameScoreTable.size).totalScore;
    }
    getPreviousFrameResult() {
        if (!this.gameScoreTable.has(this.gameScoreTable.size - 1)) {
            return -1;
        }
        return this.gameScoreTable.get(this.gameScoreTable.size - 1).result;
    }
    getPreviousFrameScore() {
        if (!this.gameScoreTable.has(this.gameScoreTable.size - 1)) {
            return -1;
        }
        return this.gameScoreTable.get(this.gameScoreTable.size - 1).frameScore;
    }
    // Метод, который пробегается по ключам из массива pointsAccuralQueue и производит дополнительное начисление
    // очков полям frameScore и totalScore в тех фреймах, где был strike/spear
    updateFrameAndTotalScore(valueOfFrame) {
        for (let i = 0; i < this.pointsAccuralQueue.length; i++) {
            let frame = this.gameScoreTable.get(this.pointsAccuralQueue[i][0]);
            frame.frameScore += valueOfFrame;
            // Обновление полей totalScore, начиная с текущего фрейма
            for (let z = this.pointsAccuralQueue[i][0]; z <= this.gameScoreTable.size; z++) {
                this.gameScoreTable.get(z).totalScore += valueOfFrame;
            }
            // В массиве pointsAccuralQueue лежат вложенные массивы вида [number, number], где первое число - номер фрейма,
            // а второе кол-во необходимых "обновлений" полей frameScore и totalScore.
            //
            // При достижении 0 вторым значением, элемент удаляется из массива
            this.pointsAccuralQueue[i][1] -= 1;
            if (this.pointsAccuralQueue[i][1] <= 0) {
                this.pointsAccuralQueue.splice(i, 1);
                i--;
            }
        }
        return 0;
    }
    // Метод, который предназначен для записи значений броска в таблицу gameScoreTable. Принимает номер фрейма и значение, 
    // которое необходимо записать. В случае отсутствия требуемого фрейма, создаёт его.
    recordingResultToFrame(numberOfFrame, valueOfFrame) {
        let frame;
        if (this.gameScoreTable.has(numberOfFrame)) {
            frame = this.gameScoreTable.get(numberOfFrame);
        }
        else {
            frame = this.gameScoreTable.set(numberOfFrame, {
                frame: numberOfFrame,
                result: [],
                frameScore: 0,
                totalScore: 0
            }).get(numberOfFrame);
            if (this.gameScoreTable.has(numberOfFrame - 1)) {
                frame.totalScore = this.gameScoreTable.get(numberOfFrame - 1).totalScore;
            }
        }
        if (valueOfFrame === 10) {
            frame.result.push("X");
        }
        else if (frame.frameScore + valueOfFrame === 10) {
            frame.result.push("/");
        }
        else {
            frame.result.push(valueOfFrame);
        }
        frame.frameScore += valueOfFrame;
        frame.totalScore += valueOfFrame;
        return 0;
    }
    // Метод, который контролирует распределение бросков, обновление фреймов с strike/spear, а также отслеживает 
    // конец игры (достижение 3-го броска в 10 фрейме, либо 11 фремйа) и препятствует дальнейшей записи значений
    //
    // При вызове метода значение currentFrame увеличивается на 1, исключением являются случаи, когда во фрейме был
    // произведён 1 бросок и 10 фрейм. в этих случаях перед окончанием метода значение currentFrame уменьшается на 1, чтобы
    // при следующем запуске оказаться вновь в нужном фрейме
    throwDistribution(valueOfFrame) {
        // Условие, которое препятствует дальнейшей записи бросков в случае достижения конца игры (3-го броска в 10 фрейме)
        if ((this.gameScoreTable.has(10) && this.gameScoreTable.get(10).result.length === 3) || this.currentFrame === 11) {
            return -1;
        }
        this.currentFrame += 1;
        this.updateFrameAndTotalScore(valueOfFrame);
        if (this.gameScoreTable.has(this.currentFrame)) {
            // Случай spear
            if (this.gameScoreTable.get(this.currentFrame).frameScore + valueOfFrame === 10) {
                if (this.currentFrame !== 10) {
                    this.pointsAccuralQueue.push([this.currentFrame, 1]);
                }
            }
            // Условие выхода из метода в случае попытки добавления 3 броска во фрейм без strike/spear
            if (this.gameScoreTable.get(this.currentFrame).result.length === 2) {
                if (this.gameScoreTable.get(this.currentFrame).frameScore < 10) {
                    return 0;
                }
            }
            this.recordingResultToFrame(this.currentFrame, valueOfFrame);
            if (this.currentFrame === 10) {
                this.currentFrame -= 1;
            }
        }
        else {
            // Случай strike
            if (valueOfFrame === 10) {
                if (this.currentFrame !== 10) {
                    this.pointsAccuralQueue.push([this.currentFrame, 2]);
                }
                this.recordingResultToFrame(this.currentFrame, valueOfFrame);
                if (this.currentFrame === 10) {
                    this.currentFrame -= 1;
                }
            }
            else {
                this.recordingResultToFrame(this.currentFrame, valueOfFrame);
                this.currentFrame -= 1;
            }
        }
        return 0;
    }
}
module.exports = Game;
