from PIL import Image
from pathlib import Path
import os
from minio import Minio
from minio.credentials import EnvMinioProvider
from dotenv import load_dotenv
from io import BytesIO
import pillow_jxl
import shutil

Image.MAX_IMAGE_PIXELS = None

load_dotenv()

project_root = Path(__file__)
while not (project_root / "Cargo.toml").exists():
    project_root = project_root.parent

minio_client = Minio(
    os.environ["MINIO_SERVER_URL"],
    credentials=EnvMinioProvider(),
    secure=False,
)

uploaded_objects = set(
    [o.object_name for o in minio_client.list_objects("islandsmedia", recursive=True)]
)


class ProcessedMedia:
    def __init__(self, fullname: str, data: BytesIO, length: int) -> None:
        self.fullname = fullname
        self.data = data
        self.length = length


def already_uploaded(island_id: str, media_name: str) -> bool:
    return f"{island_id}/{media_name}" in uploaded_objects


def process_image(
    island_id: str, media_path: Path, media_name: str
) -> list[ProcessedMedia] | None:
    result = []

    def process(suffix: str, **kwargs):
        io = BytesIO()
        length = 0
        new_name = str(Path(media_name).with_suffix(suffix))
        if already_uploaded(island_id, new_name):
            print(f"Skipping {media_path.with_suffix(suffix)} as it's already uploaded")
            return

        cached = media_path.with_suffix(suffix)
        if cached.exists():
            print(f"Using existing file for {cached}")
            data = cached.read_bytes()
            io.write(data)
            length = len(data)
            io.seek(0)
        else:
            print(f"Converting {media_path} to {suffix[1:]} image.")
            img = Image.open(media_path)
            has_alpha = img.mode.count("A") or "transparency" in img.info
            if not img.mode.count("RGB"):
                img = img.convert("RGBA" if has_alpha else "RGB")

            img.save(io, suffix[1:], **kwargs, has_alpha=has_alpha)
            io.seek(0)
            open(cached, "wb").write(io.read())
            io.seek(0)
            length = len(io.getvalue())

        result.append(ProcessedMedia(f"{island_id}/{new_name}", io, length))
        shutil.move(media_path, Path("cache") / "redundant_images" / media_name)

    process(".avif", quality=70)
    # process(".jxl", quality=70)
    return result


def process_video(
    island_id: str, media_path: Path, media_name: str
) -> list[ProcessedMedia] | None:
    data = media_path.read_bytes()
    return [
        ProcessedMedia(
            f"{island_id}/{media_name}",
            BytesIO(data),
            len(data),
        )
    ]


processor_map = [
    ({".png", ".jpg", ".jpeg"}, process_image),
    ({".mp4"}, process_video),
]

islands_root = project_root / "src-media" / "islands"


def format_size(b: float) -> str:
    names = ["Bytes", "KB", "MB"]
    i = 0
    while b >= 1024 and i < len(names) - 1:
        b /= 1024
        i += 1

    return f"{b} {names[i]}"


for island_id in os.listdir(islands_root):
    island_media = islands_root / island_id / island_id
    if not island_media.exists():
        continue

    for media_name in os.listdir(island_media):
        media_path = island_media / media_name
        if already_uploaded(island_id, media_name):
            print(f"Skipping {media_path} as it's already uploaded")
            continue

        for ext, proc in processor_map:
            if not media_path.suffix in ext:
                continue

            processed = proc(island_id, media_path, media_name)
            if processed == None:
                continue
            for result in processed:
                if result == None:
                    continue
                if result.length == 0:
                    raise ValueError(f"No data to upload for {result.fullname}")

                print(f"Uploading {result.fullname} {format_size(result.length)}")

                minio_client.put_object(
                    "islandsmedia",
                    result.fullname,
                    result.data,
                    result.length,
                )
