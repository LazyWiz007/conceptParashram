# Photos

Only `avatar.*` is read from this folder — it becomes the portrait on the
athlete badge in the bottom-right of the page.

The About carousel reads `public/media/about/` instead, in filename order:

| File | Caption |
|---|---|
| `01-bike-flyover.webp` | Bike leg |
| `02-lv-rain.webp` | Training in the wet |
| `03-5i50.webp` | 5i50 Chennai |
| `04-goa-start.webp` | IRONMAN 70.3 Goa |

Order and captions live in `aboutPhotos` in `content/site.ts`. Replace a file
with the same name to swap the picture without touching code.

The remaining images here fed the old scrolling Reach gallery, which is gone.
They are kept because they are good shots and cost nothing to leave in place.
