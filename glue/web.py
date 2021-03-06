import tornado.ioloop
import tornado.web
from jina import Client, DocumentArray, Document
import json
import os
import time

port = 45679
c = Client(host=f"grpc://localhost:{port}", asyncio=True)

def getTime(t: int):
    m,s = divmod(t, 60)
    h, m = divmod(m, 60)
    t_str = "%02d:%02d:%02d" % (h, m, s)
    print (t_str)
    return t_str

def cutVideo(start_t: str, length: int, input: str, output: str):
    os.system(f'ffmpeg -ss {start_t} -i {input} -t {length} -c:v copy -c:a copy -y {output}')

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello World")

    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        print(data)
        inputs = DocumentArray([Document(uri=file["uri"], id=data["uid"] + '|**|' + os.path.basename(file["uri"]))  for file in data["files"] ])
        t1 = time.time()
        async for resp in c.post('/index', inputs=inputs):
            t2 = time.time()
            print(t2 - t1)
            print(t1)
            print(t2)
            print(resp)
        # print(res)
            self.write({
                "code": 0,
                "message": "ok"
                })
            self.finish()

class SearchHandler(tornado.web.RequestHandler):
    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        print(data)
        t1 = time.time()
        inputs = DocumentArray([Document(text=doc["text"]) for doc in data["data"]])
        async for resp in c.post('/search', inputs=inputs, parameters={
            "thod": data["thod"] if "thod" in data else None,
            "doc_ids": data["doc_ids"] if "doc_ids" in data else None,
            "uid": data["uid"]
            }):
            t2 = time.time()
            print("cost:", t2 - t1)
            print(t1)
            print(t2)
            print(resp)
        # print(res)
            self.write({
                "code": 0,
                "message": "ok",
                "data": [{
                    "text": doc.text,
                    "matches": doc.matches.to_dict()
                } for doc in resp]
            })
            self.finish()

class CutHandler(tornado.web.RequestHandler):
    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        print(data)

        start_t = getTime(data["start"])
        cutVideo(start_t,data["len"], data["input"], data["output"])
        self.write({
            "code": 0,
            "message": "ok"
        })

class DeleteDoc(tornado.web.RequestHandler):
    async def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        print(data)
        async for resp in c.post('/delete', parameters={"ids": data["doc_ids"] if "doc_ids" in data else None}):
            print(resp)
        # print(res)
            self.write({
                "code": 0,
                "message": "ok"
            })
            self.finish()

def make_app():
    return tornado.web.Application([
        tornado.web.url(r"/", MainHandler),
        tornado.web.url(r"/search", SearchHandler),
        tornado.web.url(r"/cut", CutHandler),
        tornado.web.url(r"/deleteDoc", DeleteDoc)
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8900)
    tornado.ioloop.IOLoop.current().start()