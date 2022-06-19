import { Body, Controller, Get, Headers, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express'
import axios from 'axios';
import { ResponseEntity } from './interface';
import fs from 'fs'
import path from 'path'
import { outputDir, videosDir } from './dirs';

const baseURL = "http://localhost:8900"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('search')
  async search(@Body() body: {texts: string[], thod: number, doc_ids: string[]}, @Headers("token") uid) {
    Logger.log(uid)
    const data = body.texts.map(item => ({
      text: item
    }))
    const res = await axios.post(`${baseURL}/search`, {
      data,
      thod: body.thod,
      doc_ids: body.doc_ids,
      uid
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    return res.data
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Body() body, @Headers("token") uid): Promise<ResponseEntity> {
    console.log(file, body, uid)
    const filePath = path.resolve(videosDir, uid, file.originalname)
    try {
      if (!fs.existsSync(path.join(videosDir, uid))) {
        fs.mkdirSync(path.join(videosDir, uid))
      }
      fs.writeFileSync(filePath, file.buffer)
      Logger.log(`保存成功! path: ${filePath}`)
    } catch(e) {
      Logger.error(e)
    }
    
    try {
      await axios.post(`${baseURL}`, {
        files: [
          {
            uri: path.join('static', 'videos', uid, file.originalname)
          }
        ],
        uid
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      Logger.log(`tornado index succuss`)
    } catch(e) {
      Logger.error(e)
    }
    
    
    return {
      code: 0,
      message: 'ok'
    }
  }

  @Get('listOutput')
  listOutput(@Headers("token") uid) {
    return this.appService.listOutput(uid)
  }

  @Get('listSource')
  listSource(@Headers("token") uid) {
    return this.appService.listSource(uid)
  }

  @Post('rename')
  rename(@Body() body: { source: string, target: string }, @Headers("token") uid) {
    return this.appService.rename(body.source, body.target, uid)
  }

  @Post("delete")
  delete(@Body() body: { source: string }, @Headers("token") uid) {
    return this.appService.delete(body.source, uid)
  }

  @Post("exist")
  exist(@Body() body: { source: string }, @Headers("token") uid) {
    return this.appService.exist(body.source, uid)
  }

  @Post("clear")
  clear(@Headers("token") uid) {
    return this.appService.clear(uid)
  }

  @Post("cut")
  async cut(@Body() body: { start: number, len: number, mid: string, uri: string }, @Headers("token") uid) {
    const userOutputDir = path.join(outputDir, uid)
    if (!fs.existsSync(userOutputDir)) {
      fs.mkdirSync(userOutputDir)
    }
    const res = await axios.post(`${baseURL}/cut`, {
      start: body.start,
      len: body.len,
      input: path.join(videosDir, uid, path.basename(body.uri)),
      output: path.join(userOutputDir, `${body.mid}.mp4`)
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    return res.data
  }
  @Post("deleteDoc")
  async deleteDoc(@Body() body: { doc_ids: string[] }): Promise<ResponseEntity> {
    if (!body.doc_ids) {
      return {
        code: 1,
        message: "doc_ids is undefined"
      }
    }

    const res = await axios.post<ResponseEntity>(`${baseURL}/deleteDoc`, {
      doc_ids: body.doc_ids,
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    for (const id of body.doc_ids) {
      fs.unlinkSync(path.join(videosDir, ...id.split("|**|")))
    }
    return res.data
  }
}
