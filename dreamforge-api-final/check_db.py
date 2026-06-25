import asyncio
from uuid import UUID

from app.db.session import AsyncSessionLocal
from app.repositories.scene_graph_repository import SceneGraphRepository
from app.repositories.storyboard_repository import StoryboardRepository


DREAM_ID = UUID("c7cf064e-aba6-41f0-b6e0-2337318fe28c")


async def check():
    async with AsyncSessionLocal() as db:

        sg = await SceneGraphRepository(db).get_latest_for_dream(DREAM_ID)
        print("\n===== SCENE GRAPH =====")
        print(sg.graph_json if sg else "NONE")

        sb = await StoryboardRepository(db).get_for_dream(DREAM_ID)

        print("\n===== STORYBOARD =====")

        if sb:
            print("Panels:", len(sb.panels))

            for p in sb.panels:
                print(
                    p.sequence_order,
                    p.scene_description,
                    p.prompt_text,
                )
        else:
            print("NONE")


asyncio.run(check())