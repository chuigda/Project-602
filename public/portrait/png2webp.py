import cv2, sys

def main(args):
   if len(args) < 3:
      print('Usage: python png2webp.py <input-png> <output-webp>')
      return

   input_png = args[1]
   output_webp = args[2]

   # convert PNG to WebP
   img = cv2.imread(input_png, cv2.IMREAD_UNCHANGED)
   print('converting', input_png, '->', output_webp)
   cv2.imwrite(output_webp, img, [int(cv2.IMWRITE_WEBP_QUALITY), 90])

if __name__ == '__main__':
    main(sys.argv)
