import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs'
import { glueDir, jinaDir, outputDir, videosDir } from './dirs';
import { ResponseEntity } from './interface';
import path from 'path'
import { ChildProcess, spawn } from 'child_process'
import fse from 'fs-extra'

const sleep = (s: number) => new Promise<void>((resolve) => setTimeout(resolve, s*1000))

@Injectable()
export class AppService {
  tornadoProcess: ChildProcess
  jinaProcess: ChildProcess
  constructor() {
    this.launchTornado()
    this.launchJina()
  }

  launchTornado() {
    this.tornadoProcess = spawn('python', [path.join(glueDir, 'web.py')])
    this.tornadoProcess.stderr.on('data', data => {
      console.log(data.toString())
    })
    this.tornadoProcess.on('close', code => {
      Logger.log("tornadoProcess close with " + code)
    })
  }

  launchJina() {
    this.jinaProcess = spawn('python', [path.join(jinaDir, 'app2.py')], {
      cwd: jinaDir
    })
    this.jinaProcess.stdout.on('data', data => {
      console.log(data.toString())
    })
    this.jinaProcess.stderr.on('data', data => {
      console.log(data.toString())
    })
    this.jinaProcess.on('close', code => {
      Logger.log("jinaProcess close with " + code)
    })
  }

  getHello(): string {
    return 'Hello World!';
  }

  listOutput(): ResponseEntity<string[]> {
    const files = fs.readdirSync(outputDir)
    return {
      code: 0,
      message: 'ok',
      data: files.filter(f => f.endsWith('.mp4'))
    }
  }
  listSource(): ResponseEntity<string[]> {
    const files = fs.readdirSync(videosDir)
    return {
      code: 0,
      message: 'ok',
      data: files.filter(f => f.endsWith('.mp4'))
    }
  }

  listVideos() {
    return fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'))
  }

  rename(source: string, target: string): ResponseEntity<void> {
    try {
      fs.renameSync(path.join(outputDir, source), path.join(outputDir, target))
      return {
        code: 0,
        message: 'ok'
      }
    } catch (e) {
      return {
        code: 1,
        message: e.message
      }
    }
  }

  delete(source: string): ResponseEntity<void> {
    const targetSource = path.resolve(outputDir, source)
    if (targetSource.startsWith(outputDir)) {
      try {
        fs.unlinkSync(targetSource)
        return {
          code: 0,
          message: 'ok'
        }
      } catch (e) {
        return {
          code: 1,
          message: e.message
        }
      }

    } else {
      return {
        code: 1,
        message: 'source not in output'
      }
    }
  }
  exist(source: string): ResponseEntity<boolean> {
    const targetSource = path.resolve(videosDir, source)
    return {
      code: 0,
      message: 'ok',
      data: fs.existsSync(targetSource)
    }

  }
  async clear(): Promise<ResponseEntity> {
    this.jinaProcess.kill("SIGINT")
    fse.removeSync(path.join(jinaDir, 'workspace'))
    const videos = this.listVideos()
    for (const video of videos) {
      fse.removeSync(path.join(videosDir, video))
    }
    await sleep(10)
    console.log(this.jinaProcess.killed)
    this.launchJina()
    await sleep(15)
    return {
      code: 0,
      message: "ok"
    }
  }
}
