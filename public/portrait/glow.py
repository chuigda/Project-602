import cv2, sys

ThemeColors = {
   'red': [16, 64, 255, 255],
   'cyan': [232, 255, 0, 255],
   'white': [255, 255, 255, 255],
}

def main(argv):
   if len(argv) < 5:
      print('Usage: python glow.py <image-path> <theme-color> <output-image> <conv-size>')
      return

   image_path = argv[1]
   image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

   # create an image by replacing all non-transparent pixels to white
   glow = image.copy()
   glow[glow[:, :, 3] != 0] = ThemeColors[argv[2]]

   conv_size = int(argv[4])
   # create a blurred image
   blurred = cv2.blur(glow, (conv_size, conv_size))
   # blurred = cv2.GaussianBlur(glow, (conv_size, conv_size), 0)

   # put the original image on top of the blurred image
   result = blurred.copy()
   result[image[:, :, 3] != 0] = image[image[:, :, 3] != 0]

   cv2.imwrite(argv[3], result)

   cv2.imshow('result', cv2.resize(result, (image.shape[1] // 2, image.shape[0] // 2)))
   cv2.waitKey(0)

if __name__ == '__main__':
    main(sys.argv)
