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

  listOutput(uid: string): ResponseEntity<string[]> {
    const userDir = path.join(outputDir, uid)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir)
    }
    const files = fs.readdirSync(userDir)
    return {
      code: 0,
      message: 'ok',
      data: files.filter(f => f.endsWith('.mp4'))
    }
  }
  listSource(uid: string): ResponseEntity<string[]> {
    const userDir = path.join(videosDir, uid)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir)
    }
    const files = fs.readdirSync(userDir)
    return {
      code: 0,
      message: 'ok',
      data: files.filter(f => f.endsWith('.mp4'))
    }
  }

  listVideos(uid: string) {
    const userDir = path.join(videosDir, uid)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir)
    }
    return fs.readdirSync(userDir).filter(f => f.endsWith('.mp4'))
  }

  rename(source: string, target: string, uid: string): ResponseEntity<void> {
    try {
      fs.renameSync(path.join(outputDir, uid, source), path.join(outputDir, uid, target))
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

  delete(source: string, uid: string): ResponseEntity<void> {
    const targetSource = path.resolve(outputDir, uid, source)
    if (targetSource.startsWith(path.join(outputDir, uid))) {
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
  exist(source: string, uid: string): ResponseEntity<boolean> {
    const targetSource = path.resolve(videosDir, uid, source)
    return {
      code: 0,
      message: 'ok',
      data: fs.existsSync(targetSource)
    }

  }
  async clear(uid: string): Promise<ResponseEntity> {
    // this.jinaProcess.kill("SIGINT")
    // fse.removeSync(path.join(jinaDir, 'workspace'))
    // const videos = this.listVideos(uid)
    // for (const video of videos) {
    //   fse.removeSync(path.join(videosDir, video))
    // }
    // await sleep(10)
    // console.log(this.jinaProcess.killed)
    // this.launchJina()
    // await sleep(15)
    return {
      code: 0,
      message: "ok"
    }
  }
}
