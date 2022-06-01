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
    for doc in resp.docs:
        print(f'check_index: {doc.uri}')

def getTime(t: int):
    m,s = divmod(t, 60)
    h, m = divmod(m, 60)
    t_str = "%02d:%02d:%02d" % (h, m, s)
    print (t_str)
    return t_str

def cutVideo(start_t: str, length: int, input: str, output: str):
    os.system(f'ffmpeg -ss {start_t} -i {input} -t {length} -c:v copy -c:a copy static/output/{output}')

def check_search(resp: DataRequest):
    for i, doc in enumerate(resp.docs):
        print(f'Query text: {doc.text}')
        print(f'Matches: {len(doc.matches)}')
        for m in doc.matches:
            print(m)
            print(f'+- id: {m.id}, score: {m.tags["maxImageScore"]}, indexRange: {m.tags["leftIndex"]}-{m.tags["rightIndex"]}, uri: {m.tags["uri"]}')
        print('-'*10)

        leftIndex = doc.matches[0].tags["leftIndex"]
        rightIndex = doc.matches[0].tags["rightIndex"]
        t_str = getTime(leftIndex)

        # cutVideo(t_str, rightIndex - leftIndex, doc.matches[0].tags["uri"], f"match_{i}_{doc.matches[0].id}.mp4")

config()

f = Flow(protocol="grpc", port=os.environ['JINA_PORT']).add(
    uses='videoLoader/config.yml',uses_requests={"/index": "extract"}, name="video_loader"
    ).add(
        uses="customClipImage/config.yml",
        name="image_encoder",
        uses_requests={"/index": "encode"}
    ).add(
        uses="customClipText/config.yml",
        name="text_encoder",
        uses_requests={"/search": "encode"}
    ).add(
        uses="customIndexer/config.yml",
        name="indexer",
        uses_metas={"workspace": os.environ['JINA_WORKSPACE']}
    )
    # .add(
    #     uses="customRanker/config.yml",
    #     name="ranker",
    # )


with f:
    # f.post(
    #     '/index', 
    #     inputs=get_docs('static/videos'),
    #     on_done=check_index
    #     )
    # a = f.post(
    #             on='/search',
    #             inputs=DocumentArray([
    #                 # Document(text='a diagram'),
    #                 # Document(text='sports bracelet'),
    #                 # Document(text='a man on the grassland'),
    #                 # Document(text='two people'),
    #                 Document(text='whip up an egg'),
    #                 Document(text='Fried meat pie'),
    #                 Document(text='Turn over the pancake'),
    #                 Document(text='Squeeze the tomato sauce')
    #             ]),
    #             on_done=check_search)
    f.block()