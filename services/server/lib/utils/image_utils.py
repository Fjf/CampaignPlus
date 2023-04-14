import os

from PIL import Image


def resize_image(filename: str) -> None:
    """
    Reduces an image size

    :param filename:
    :return:
    """

    image = Image.open(filename)

    width, height = image.size
    if width > height:
        ratio = height / width
        new_image = image.resize((1500, int(1500 * ratio)))
    else:
        ratio = width / height
        new_image = image.resize((int(ratio * 1500), 1500))
    new_image.save(filename)


if __name__ == "__main__":
    root_path = "../../../client/public/static/images/uploads/"
    for path in os.listdir(root_path):
        if os.path.isfile(root_path + path):
            resize_image(root_path + path)