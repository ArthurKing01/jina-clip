import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express'
import axios from 'axios';
import { ResponseEntity } from './interface';
import fs from 'fs'
import path from 'path'
import { outputDir, videosDir } from './dirs';

const baseURL = "http://localhost:8888"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('search')
  async search(@Body() body: {texts: string[], thod: number, doc_ids: string[]}) {
    const data = body.texts.map(item => ({
      text: item
    }))
    const res = await axios.post(`${baseURL}/search`, {
      data,
      thod: body.thod,
      doc_ids: body.doc_ids
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    return res.data
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Body() body): Promise<ResponseEntity> {
    console.log(file, body)
    const filePath = path.resolve(videosDir, file.originalname)
    fs.writeFileSync(filePath, file.buffer)

    await axios.post(`${baseURL}`, {
      files: [
        {
          uri: path.join('static', 'videos', file.originalname)
        }
      ],
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    
    return {
      code: 0,
      message: 'ok'
    }
  }

  @Get('listOutput')
  listOutput() {
    return this.appService.listOutput()
  }

  @Get('listSource')
  listSource() {
    return this.appService.listSource()
  }

  @Post('rename')
  rename(@Body() body: { source: string, target: string }) {
    return this.appService.rename(body.source, body.target)
  }

  @Post("delete")
  delete(@Body() body: { source: string }) {
    return this.appService.delete(body.source)
  }

  @Post("exist")
  exist(@Body() body: { source: string }) {
    return this.appService.exist(body.source)
  }

  @Post("clear")
  clear() {
    return this.appService.clear()
  }

  @Post("cut")
  async cut(@Body() body: { start: number, len: number, mid: string, uri: string }) {
    const res = await axios.post(`${baseURL}/cut`, {
      start: body.start,
      len: body.len,
      input: path.join(videosDir, path.basename(body.uri)),
      output: path.join(outputDir, `${body.mid}.mp4`)
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
      fs.unlinkSync(path.join(videosDir, id))
    }
    return res.data
  }
}
