# Un-Said demo cast sheet (fictional people only)

Everyone here is made up. Never generate a real person. There is **no dad** in this demo, so keep fathers out of every image.
Root: `/workspace/demo-photos/`. Contact sheet: `contact-sheet.jpg`.

## Reference images (pass these in `reference_image_paths`)
| Character | Best ref(s) |
|---|---|
| Son, adult (19-20) | `refs/son-adult.jpg` (headshot), `refs/mom-son-20.jpg` (scene, the original adult anchor) |
| Son, teen | `refs/son-teen.jpg` (about 14), `refs/mom-son-12.jpg` (about 12, the original base image) |
| Mom | `refs/mom.jpg` (about 48 headshot), `refs/mom-son-12.jpg` (about 40), `refs/mom-son-20.jpg` (about 48) |
| Sarah (girlfriend) | `refs/sarah.jpg` (headshot), `refs/sarah-son-scene.jpg` (coffee date, her first/anchor image) |
| Michael (best friend) | `refs/michael.jpg` (headshot), `refs/michael-son-scene.jpg` (basketball court, his first/anchor image) |

For two-person scenes, the combo that worked best was **son ref (`refs/mom-son-20.jpg`) + the other person's anchor scene** (`refs/sarah-son-scene.jpg` or `refs/michael-son-scene.jpg`).

## The son (phone owner, shown at ages 12 to 20)
Indian-American, warm medium-brown skin, dark brown eyes, thick straight black hair (short sides, fuller and a little messy on top), friendly easy closed- or open-mouth smile, slim build that turns lean and athletic.
- **12:** boyish round face, no facial hair, navy polo and backpack. (`mom-12.jpg`, `mom-12-birthday.jpg`)
- **13-14:** slightly longer face, still smooth-skinned, sporty (blue basketball jersey). (`mom-13-holi.jpg`, `mom-14.jpg`)
- **15-16:** lanky, faint mustache fuzz, gangly. (`mom-15-thanksgiving.jpg`, `mom-16.jpg`)
- **17-18:** nearly adult, mostly clean-shaven, fuller face. (`mom-17-*.jpg`, `mom-18*.jpg`)
- **19-20:** leaner jaw, light stubble and thin mustache, same hair. Typical clothes: heather gray hoodie or crewneck, olive or navy sweatshirts, plain tees, flannel.

## Mom (about 40 when he's 12, about 48 when he's 20)
Indian woman, medium-brown skin, warm round face, kind eyes, soft smile, small gold stud earrings, gold bangle. Signature: **one long black braid over the shoulder**. She always wears cotton kurtas (sage green, teal, lavender, mustard, floral), and silk sarees for big occasions (maroon with gold border at graduation, pink and gold at Diwali).
- **40-42:** hair fully black, no glasses.
- **43-45:** first gray strands at the temples; may wear thin glasses from about 45.
- **46-48:** clear gray streaks through the braid, thin wire-rimmed glasses, light laugh lines.

## Sarah (girlfriend, about 19-20)
Fictional Latina college student. Warm light-tan skin, **shoulder-to-chest-length wavy dark brown hair with soft caramel highlights** (balayage), round face, **deep dimples**, light freckles across her nose, **small gold nose stud** (left nostril), **thin gold hoop earrings**, big open laugh. Petite to average build. Style: cream knit sweaters, denim jacket, sundresses (white eyelet, rust), oversized sweatshirts, a claw clip, round tortoiseshell glasses for studying.

## Michael (best friend, about 18-20)
Fictional Black American guy. Dark brown skin, **tall and broad-shouldered with an athletic, muscular build**, **short high-top fade with a crisp line-up** (tight curls on top), **short neat full beard**, huge bright grin, **thin silver chain necklace** that's always on. Style: athletic tanks (red, gray), black basketball shorts, hoodies (gray, maroon, navy), plain tees, knit sweaters.

## Extra fictional contacts (phone/)
- **Priya** (`phone/contact-priya.jpg`): Indian-American woman about 21, long straight black hair with a center part, silver hoops, mustard hoodie. Friend or cousin.
- **Coach Davis** (`phone/contact-coach-davis.jpg`): white man about 55, gray buzz cut and goatee, navy quarter-zip, whistle. His old basketball coach.
- **Aunty Meena** (`phone/contact-aunty-meena.jpg`): Indian woman about 58, salt-and-pepper bun, bindi, gold jhumkas, peacock-blue saree.
- **Jake** (`phone/contact-jake.jpg`): white guy about 20, messy sandy-blond hair, freckles, red flannel. Roommate.
- **Tasha** (`phone/contact-tasha.jpg`): Black woman about 21, natural curly high puff, gold round glasses, lavender sweatshirt. Lab partner.

## Headshots and wallpapers
- `headshots/son.jpg`, `headshots/mom.jpg`, `headshots/sarah.jpg`, `headshots/michael.jpg`: square, shoulders up, soft natural background.
- `phone/lockscreen.jpg` (9:16): son and Sarah at a lake sunset, open sky at the top for the clock.
- `phone/homescreen.jpg` (9:16): son (20) and Mom (48) on the front porch at golden hour, her head on his shoulder.

## Prompt style that worked
> "Candid smartphone photo of the SAME [mother and son / young couple / two best friends] from the reference images ... [scene] ... the SAME 20-year-old Indian young man (thick black hair, light stubble, same face as first reference) and the SAME [Sarah/Michael] from the second reference ([repeat their key traits]) ... natural light, authentic skin texture, both faces sharp and clearly visible, realistic, only the two of them, no text, no watermark."

Tips:
- Always restate the signature traits (braid, glasses or gray for Mom; nose stud, hoops and dimples for Sarah; high-top fade, beard and silver chain for Michael).
- Say "no readable text" and avoid ID cards or signs, since text comes out garbled.
- Use 4:3 for scenes, 3:4 for selfies, 1:1 for headshots and 9:16 for wallpapers.
- Swimsuit or beach prompts got blocked by the content filter, so avoid them.
- Add "only the two of them" so no extra adults (e.g. a father) appear.

## Photo list (37 scene photos)
**Mom + son (13):** mom-12 (porch), mom-12-birthday (candles), mom-13-holi (colors), mom-14 (after a basketball game), mom-15-thanksgiving (turkey and biryani), mom-16 (new car keys, red bow), mom-17-kitchen (rolling chapati), mom-17-homecoming (fixing his tie), mom-18 (graduation, garland, teary mom), mom-18-movein (dorm hug), mom-19-diwali (diya selfie), mom-20 (campus visit with tiffin), mom-20-garden (tomatoes).
**Sarah + son (12):** sarah-coffee, sarah-campus, sarah-concert, sarah-roadtrip, sarah-study, sarah-sunset, sarah-picnic, sarah-christmas, sarah-cooking, sarah-rain, sarah-icecream, sarah-market.
**Michael + son (12):** michael-court, michael-gaming, michael-latenight, michael-roadtrip, michael-gradhug, michael-tailgate, michael-gym, michael-hike, michael-cookout, michael-friendsgiving, michael-barbershop, michael-lake.
**extras/ (6, from an earlier pass, old naming):** son13-mom-kitchen, son15-mom-sciencefair, son17-mom-driving, son18-mom-graduation, son19-gf-campus-walk, son20-bff-videogames.

## Shot style (Nick's standing preference, applies to every new image)
- Looks like it was really shot on an iPhone by a friend or family member: phone-camera look, slight imperfect framing, natural or mixed indoor light, a bit of noise in low light, no studio lighting, no glossy "AI" look.
- Background is NOT artificially blurred: phone-style deep focus, the setting reads clearly but the people are the subject. No creamy bokeh/portrait-mode look.
- Mostly CANDID: people mid-action, talking, laughing at each other, looking at what they're doing. Nobody posing or staring at the camera (an occasional selfie is ok but rare).
- Zoomed out a bit (waist-up to full body, setting visible), varied angles (side, over-the-shoulder, slightly high/low, across the room).
- Mix orientations: about half vertical (3:4 or 9:16, phone held upright) and half horizontal (4:3).

## batch2
**Mom + son, candid phone style (14, in `batch2/`):** mom-son12-homework (kitchen table math, H), mom-son12-grocery (produce aisle, V), mom-son13-bike (fixing bike chain in driveway, H), mom-son13-temple (ringing temple bell, V), mom-son14-tv (couch, popcorn and chai, H), mom-son14-haircut (home haircut in kitchen, V), mom-son15-laundry (tangled fitted sheet, H), mom-son16-snow (shoveling, snow toss, V 9:16), mom-son16-sick (soup in bed, V), mom-son17-collegeapps (late-night laptop and chai, H), mom-son18-packing (packing for college, V 9:16), mom-son19-airport (drop-off at trunk, foil food parcel, V 9:16), mom-son19-dishes (washing dishes, V), mom-son20-walk (arm-in-arm fall evening walk, H).
**Groups / extra contacts (6, in `batch2/`):** son14-mom-aunty-carrom (carrom with Mom and Aunty Meena, H), son17-michael-coach-timeout (Coach Davis drawing a play, H), son19-priya-aunty-function (family function, samosas, cheek pinch, V), son20-sarah-mom-dinner (Mom serving at dinner with Sarah, H), son20-jake-dorm (roommate Jake, noodles and video games, H), son20-tasha-lab (chemistry lab with Tasha, V).
**Sarah + son, candid phone style (10, in `batch2/`):** sarah-thrift (holding a loud vintage windbreaker up to him, V 3:4), sarah-laundromat (folding a bedsheet together, H), sarah-bowling (she just bowled, he cheers behind, V 9:16), sarah-bookstore (he pulls a book off a high shelf, she reads, glasses, V 3:4), sarah-ikea (assembling flat-pack furniture, he frowns at instructions, she holds the allen key, H), sarah-pumpkins (carving jack-o'-lanterns, H), sarah-iceskating (she steadies him on an outdoor rink, V 9:16), sarah-boardgames (she wins, high angle, H), sarah-diner (late-night fries and milkshake, V 3:4), sarah-movienight (dorm bed, laptop, popcorn, H).
**Michael + son, candid phone style (10, in `batch2/`):** michael-moving (carrying a couch to a pickup, H), michael-tire (changing a flat on the roadside, V 3:4), michael-arcade (air hockey, V 9:16), michael-library (son asleep, Michael puts a sticky note on his head, H), michael-fishing (catching a fish off a river pier at dawn, V 3:4), michael-carwash (hose fight while washing the car, H), michael-airport (Michael asleep on his shoulder at the gate, V 3:4), michael-soccer (pickup soccer, slide tackle, H), michael-bus (laughing at a phone on a city bus, V 9:16), michael-pingpong (basement ping pong, H).
