const BridgeGame = require('./Model/BridgeGame');
const BridgeMaker = require('./BridgeMaker');
const InputView = require('./View/InputView');
const OutputView = require('./View/OutputView');
const Validation = require('./libs/Validation');
const { Console } = require('@woowacourse/mission-utils');
const { COMMAND_OPTION } = require('./libs/Constant');
const { generate } = require('./BridgeRandomNumberGenerator');
const { throwException } = require('./libs/ErrorHandler');

class BridgeGameManager {
  #bridgeGame;

  constructor() {
    this.#bridgeGame = null;
  }

  start() {
    OutputView.printStartMessage();

    this.requestBridgeSize();
  }

  requestBridgeSize() {
    InputView.readBridgeSize((size) => {
      const { errorMsg } = Validation.checkBridgeSize(size);
      if (errorMsg)
        return throwException(errorMsg, this.requestBridgeSize.bind(this));

      this.createBridgeGame(size);

      this.requestDirection();
    });
  }

  createBridgeGame(size) {
    const bridge = BridgeMaker.makeBridge(Number(size), generate);

    this.#bridgeGame = new BridgeGame(bridge);
  }

  requestDirection() {
    InputView.readMoving((direction) => {
      const { errorMsg } = Validation.checkDirection(direction);
      if (errorMsg)
        return throwException(errorMsg, this.requestDirection.bind(this));

      this.#bridgeGame.move(direction);
      this.printBridgeCrossingResult();

      this.actionAboutBridgeGame();
    });
  }

  printBridgeCrossingResult() {
    const bridgeCrossingResult = this.#bridgeGame.getBridgeCrossingResult();

    OutputView.printMap(bridgeCrossingResult);
  }

  actionAboutBridgeGame() {
    if (this.#bridgeGame.isFail()) return this.requestRestartOrQuit();

    if (this.#bridgeGame.isLast()) return this.quit();

    return this.requestDirection();
  }

  requestRestartOrQuit() {
    InputView.readGameCommand((commandOption) => {
      const { errorMsg } = Validation.checkCommandOption(commandOption);
      const callback = this.requestRestartOrQuit.bind(this);
      if (errorMsg) return throwException(errorMsg, callback);

      this.actionAboutGameCommand(commandOption);
    });
  }

  actionAboutGameCommand(commandOption) {
    if (commandOption === COMMAND_OPTION.restart) return this.restart();

    return this.quit();
  }

  restart() {
    this.#bridgeGame.retry();
    this.requestDirection();
  }

  quit() {
    this.printBridgeGameResult();
    Console.close();
  }

  printBridgeGameResult() {
    OutputView.printEndMessage(this.#bridgeGame.isFail());
    OutputView.printMap(this.#bridgeGame.getBridgeCrossingResult());
    OutputView.printResult(this.#bridgeGame.getResult());
  }
}

module.exports = BridgeGameManager;
