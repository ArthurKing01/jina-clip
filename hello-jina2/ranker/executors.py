from typing import Optional
from collections import defaultdict

import numpy as np

from jina import Document, Executor, requests


_ALLOWED_METRICS = ['min', 'max', 'mean_min', 'mean_max']
DEFAULT_FPS = 1

MAX_LENGTH = 100
THOD = 0.02

def find(list: list, fn):
    for i in list:
        if fn(i):
            return i
    return None
class SimpleRanker(Executor):
    """
    Aggregate the matches and overwrite document.matches with the aggregated results.
    """
    def __init__(
        self,
        metric: str = 'cosine',
        ranking: str = 'min',
        top_k: int = 10,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)

        if ranking not in _ALLOWED_METRICS:
            raise ValueError(
                f'ranking should be one of {_ALLOWED_METRICS}, got "{ranking}"',
            )

        self.metric = metric
        self.ranking = ranking
        self.top_k = top_k

    @requests(on='/search')
    def merge_matches(self, docs: Optional[Document] = [], paramerters = {}, **kwargs):
        if not docs:
            return
        print('merge_matches')
        top_k = int(paramerters.get('top_k', self.top_k))
        for doc in docs:
            print(doc.text)
            parents_matches = defaultdict(list)
            for m in doc.matches:
                parents_matches[m.parent_id].append(m)
            new_matches = []
            for match_parent_id, matches in parents_matches.items():
                print([{"location": m.location, "scores": m.scores[self.metric]} for m in matches])
                best_id = 0
                if self.ranking == 'min':
                    best_id = np.argmin([m.scores[self.metric].value for m in matches])
                elif self.ranking == 'max':
                    best_id = np.argmax([m.scores[self.metric].value for m in matches])
                new_match = matches[best_id]
                new_match.id = matches[best_id].parent_id
                new_match.scores = {self.metric: matches[best_id].scores[self.metric]}
                print(new_match.scores)
                print(matches, best_id, matches[best_id].location)
                location = matches[best_id].location[0]
                timestamp = location
                new_match.tags['timestamp'] = float(timestamp) / DEFAULT_FPS
                # vid = new_match.id.split('.')[0]
                # new_match.uri = f'https://www.youtube.com/watch?v={vid}'

                leftLocation = location
                rightLocation = location

                for i in range(int(location)):
                    prev_location = location - i - 1
                    m = find(matches, lambda x: x.location[0] == prev_location and x.scores[self.metric].value <= new_match.scores[self.metric].value - THOD)
                    if m is None:
                        m = find(matches, lambda x: x.location[0] == prev_location-1 and x.scores[self.metric].value <= new_match.scores[self.metric].value - THOD)
                        if m is None:
                            break
                        else:
                            leftLocation = m.location[0]
                    else:
                        leftLocation = m.location[0]

                for i in range(int(location) + 1, int(location) + MAX_LENGTH):
                    
                    m = find(matches, lambda x: x.location[0] == i and x.scores[self.metric].value <= new_match.scores[self.metric].value - THOD)
                    if m is None:
                        m = find(matches, lambda x: x.location[0] == i + 1 and x.scores[self.metric].value <= new_match.scores[self.metric].value - THOD)
                        if m is None:
                            break
                        else:
                            rightLocation = m.location[0]
                    else:
                        rightLocation = m.location[0]

                new_match.tags['leftTimestamp'] = float(leftLocation) / DEFAULT_FPS
                new_match.tags['rightTimestamp'] = float(rightLocation) / DEFAULT_FPS

                new_matches.append(new_match)

            # Sort the matches
            
            if self.ranking == 'min':
                new_matches.sort(key=lambda d: d.scores[self.metric].value)
            elif self.ranking == 'max':
                new_matches.sort(key=lambda d: -d.scores[self.metric].value)
            doc.matches = new_matches
            doc.matches = doc.matches[:top_k]
            doc.pop('embedding')

