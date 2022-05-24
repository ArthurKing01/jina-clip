from docarray import Document
from jina import Flow, DocumentArray
import os
import glob
from jina.types.request.data import DataRequest

def config():
    os.environ['JINA_PORT'] = '45679'  # the port for accessing the RESTful service, i.e. http://localhost:45678/docs
    os.environ['JINA_WORKSPACE'] = './workspace'  # the directory to store the indexed data
    os.environ['TOP_K'] = '20'  # the maximal number of results to return

def get_docs(data_path):
    for fn in glob.glob(os.path.join(data_path, '*.mp4')):
        yield Document(uri=fn, id=os.path.basename(fn))

def check_index(resp: DataRequest):
    print(resp.data)
    for doc in resp.docs:
        print(f'chunks: {len(doc.chunks)}')

def check_search(resp: DataRequest):
    for doc in resp.docs:
        print(f'Query text: {doc.text}')
        print(f'Matches: {len(doc.matches)}')
        for m in doc.matches:
            print(m)
            print(f'+- id: {m.id}, score: {m.scores["cosine"].value}, timestampe: {m.tags["timestamp"]}, range: {m.tags["leftTimestamp"]} - {m.tags["rightTimestamp"]}')
        print('-'*10)

config()

f = Flow(protocol='http').add(
    uses='videoLoader/config.yml',uses_requests={"/index": "extract"}, name="video_loader"
    ).add(
        uses="clipImage/config.yml",
        name="image_encoder",
        uses_requests={"/index": "encode"}
    ).add(
        uses="clipText/config.yml",
        name="text_encoder",
    ).add(
        uses="indexer/config.yml",
        name="indexer",
        uses_metas={"workspace": os.environ['JINA_WORKSPACE']}
    ).add(
        uses="ranker/config.yml",
        name="ranker",
    )


with f:
    # f.post(
    #     '/index', 
    #     inputs=get_docs('toy_data'),
    #     on_done=check_index
    #     )
    f.post(
                on='/search',
                inputs=DocumentArray([
                    Document(text='a diagram'),
                    Document(text='sports bracelet'),
                    # Document(text='Sports Shoes'),
                ]),
                on_done=check_search)
    # f.block()