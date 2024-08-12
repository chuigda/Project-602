export function loadImage(url: string): Promise<HTMLImageElement> {
   const img = new Image()
   img.style.display = 'none'
   img.src = url

   document.body.appendChild(img)
   return new Promise((resolve, reject) => {
      img.onload = () => {
         img.remove()
         resolve(img)
      }

      img.onerror = () => {
         img.remove()
         reject(new Error(`loadImage: failed to load image: ${url}`))
      }
   })
}
