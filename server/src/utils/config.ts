import { readFileSync } from 'fs';

export interface PrintSetting {
  path: string;
  exe: string;
  enabledWriter: boolean;
  print_step_url: string;
}

export interface LogSetting {
  path: string;
  rotatePeriod: number;
}

export interface ExportSetting {
  excel: {
    outputPath: string;
    templatePath: string;
  };
}
export interface WriteSetting {
  file: {
    templatePath: string;
  };
}
export interface AgentSetting {
  replaceSku: boolean;
  searchInputCd: string;
}

export interface Image {
  path: string;
  prefix: string;
}

/**
 * 設定ファイル
 */
export default class Config {
  static #config: Record<string, unknown> = JSON.parse(
    readFileSync(__dirname + '/configFile.json').toString(),
  );

  static #logSetting: LogSetting;
  static getLogSetting(): LogSetting {
    if (!this.#logSetting) {
      const log = Config.#config['log'] as LogSetting;
      this.#logSetting = log;
    }
    return this.#logSetting;
  }

  static #exportSetting: ExportSetting;
  static getExportSetting(): ExportSetting {
    if (!this.#exportSetting) {
      const setting = Config.#config['export'] as ExportSetting;
      this.#exportSetting = setting;
    }
    return this.#exportSetting;
  }

  static #writeSetting: WriteSetting;
  static getWriteSetting(): WriteSetting {
    if (!this.#writeSetting) {
      const setting = Config.#config['write'] as WriteSetting;
      this.#writeSetting = setting;
    }
    return this.#writeSetting;
  }
  static #agentSetting: AgentSetting;
  static getAgentSetting(agentCd: string): AgentSetting {
    if (!this.#agentSetting) {
      const setting = Config.#config['agent'] as AgentSetting;
      this.#agentSetting = setting;
    }
    return this.#agentSetting[agentCd];
  }

  static #imageSetting: Image;
  static getImageSetting(): Image {
    if (!this.#imageSetting) {
      const setting = Config.#config['image'] as Image;
      this.#imageSetting = setting;
    }
    return this.#imageSetting;
  }
}
