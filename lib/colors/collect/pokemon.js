/**
 * Scraper to get a palette for each Pokemon
 */

// Dependencies
import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { getPalette, getColor } from 'colorthief';

// Constants and helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, '..', '..', '..', '.cache', 'pokemon');
const finalColorsFile = path.join(__dirname, '..', 'pokemon.json');

// Cache location
fs.mkdirpSync(cacheDir);

// Get list
const pokemonSpecies = await cacheFetch(
  'https://pokeapi.co/api/v2/pokemon-species?limit=2000',
  path.join(cacheDir, 'data', 'pokemon-species-list.json')
);

// Collect sprites
const spritesListFile = path.join(cacheDir, 'sprites-collection.json');
let spritesList;
if (!fs.pathExistsSync(spritesListFile)) {
  spritesList = await collectSprites(pokemonSpecies);
  fs.writeFileSync(spritesListFile, JSON.stringify(spritesList, null, 2));
}
spritesList = JSON.parse(fs.readFileSync(spritesListFile, 'utf8'));

// Parse palettes
const palettes = await collectPalettes(spritesList);
fs.writeFileSync(finalColorsFile, JSON.stringify(palettes, null, 2));


async function collectPalettes(spritesList) {
  let finalColors = {};
  let paletteCount = 0;

  for (const sprite of spritesList) {
    console.log(`Collecting palette for ${sprite.name}...`);
    paletteCount = paletteCount + 1;

    // Get palette
    const palette = await getPalette(sprite.sprite, 5, 2);
    const colors = palette.map(c => rgbToHex(c[0], c[1], c[2]));
    finalColors[sprite.name] = colors;
  }

  return finalColors;
}


async function collectSprites(pokemonSpecies) {
  let spritesList = [];

  for (const pokemon of pokemonSpecies.results) {
    console.log(`Collecting sprites for ${pokemon.name}...`);

    const speciesData = await cacheFetch(
      pokemon.url,
      path.join(cacheDir, 'data', `species-${pokemon.name}.json`)
    );

    // Get the species name
    let speciesNameEn = speciesData.names.find(
      (n) => n.language ? n.language.name === 'en' : false
    );
    let speciesName = speciesNameEn ? speciesNameEn.name : false;
    speciesName = speciesName ? speciesName : titleCase(pokemon.name);

    // Has forms
    const hasForms = speciesData.forms_switchable;

    // Get varieties
    for (const variety of speciesData.varieties) {
      const varietyData = await cacheFetch(
        variety.pokemon.url,
        path.join(cacheDir, 'data', `variety-${variety.pokemon.name}.json`)
      );

      // Sprites from varieties.  Varieties don't have actual names
      spritesList = spritesList.concat(
        await parseSprites(varietyData.sprites, titleCase(varietyData.name), varietyData.name)
      );

      // Assume significant forms are not the first
      if (varietyData.forms.length > 1) {
        for (const form of varietyData.forms.slice(1)) {
          // Get form data
          const formData = await cacheFetch(
            form.url,
            path.join(cacheDir, 'data', `form-${form.name}.json`)
          );

          // Get form name
          let formNameEn = formData.names.find(
            (n) => n.language ? n.language.name === 'en' : false
          );
          let formName = formNameEn ? formNameEn.name : false;
          formName = formName ? formName : titleCase(form.name);

          // Sprites from forms
          const parsed = await parseSprites(formData.sprites, formName, formData.name);
          spritesList = spritesList.concat(parsed);
        }
      }
    }
  }

  return spritesList;
}


async function parseSprites(sprites, originalName, nameId) {
  const spritesFound = [];

  for (const sprite in sprites) {
    const spriteUrl = sprites[sprite];
    if (sprite.startsWith('front_') && spriteUrl) {
      // Make name parts from sprite
      const spriteNameParts = sprite.replace('front_', '').split('_');

      // If default don't alter name
      const name = spriteNameParts[0] === 'default' ? originalName :
        `${originalName} ${spriteNameParts.map(n => '(' + titleCase(n) + ')').join(' ')}`;

      // Get sprite file
      const spriteFile = path.join(
        cacheDir,
        'sprites',
        `${nameId}-${sprite}.png`
      );
      await cacheFetch(
        spriteUrl,
        spriteFile,
        'buffer'
      );

      // Update collection
      spritesFound.push({
        name: fixName(name),
        sprite: spriteFile,
      });
    }
  }

  return spritesFound;
}


function fixName(name) {
  if (name.indexOf(' Alola') > -1) {
    name = `Alolan ${name.replace('Alola', '')}`;
  }
  if (name.indexOf(' Alola') > -1) {
    name = `Galarian ${name.replace('Galar', '')}`;
  }
  if (name.indexOf(' Mega') > -1) {
    name = `Mega ${name.replace('Mega', '')}`;
  }
  if (name.indexOf('(Shiny)') > -1) {
    name = `Shiny ${name.replace('(Shiny)', '')}`;
  }
  name = name.replace(/ gmax/gi, ' Gigantamax');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}


async function cacheFetch(url, filename, type = 'json', whoa = true) {
  if (!fs.pathExistsSync(filename)) {
    fs.mkdirpSync(path.dirname(filename));
    const response = await fetch(url);

    if (type === 'json') {
      const data = await response.json();
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    }
    else {
      const buffer = await response.buffer();
      fs.writeFileSync(filename, buffer);
    }

    if (whoa) {
      await sleep(250);
    }
  }

  if (type === 'json') {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  }
  else {
    return fs.readFileSync(filename);
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/[_-\s]+/g, ' ')
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}


function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('');
}
