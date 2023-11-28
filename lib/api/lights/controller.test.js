// To test
import { textToColors } from './controller.js';

// Test textToColors
describe('textToColors', () => {
  test('can convert colors as expected', () => {
    // Not colors
    expect(() => {
      textToColors('');
    }).toThrow();
    expect(() => {
      textToColors('z');
    }).toThrow();

    // Core colors
    expect(textToColors('red')).toEqual({
      colorNames: ['red'],
      colors: ['#FF0000']
    });
    expect(textToColors('green')).toEqual({
      colorNames: ['green'],
      colors: ['#00FF00']
    });
    expect(textToColors('blue')).toEqual({
      colorNames: ['blue'],
      colors: ['#0000FF']
    });

    // Single color
    expect(textToColors('red')).toEqual({
      colorNames: ['red'],
      colors: ['#FF0000']
    });
    expect(textToColors('xmas')).toEqual({
      colorNames: ['Xmas'],
      colors: ['#FF0000', '#FFFFFF', '#00FF00']
    });

    // Comma color
    expect(textToColors('red, green')).toEqual({
      colorNames: ['red', 'green'],
      colors: ['#FF0000', '#00FF00']
    });
    expect(textToColors('blue, green')).toEqual({
      colorNames: ['blue', 'green'],
      colors: ['#0000FF', '#00FF00']
    });
    expect(textToColors('blue, , green, z')).toEqual({
      colorNames: ['blue', 'green'],
      colors: ['#0000FF', '#00FF00']
    });
    expect(() => {
      textToColors(',,,,');
    }).toThrow();

    // Hex colors
    expect(textToColors('#123456, #AFAFAF, #222222')).toEqual({
      colorNames: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456 #AFAFAF #222222')).toEqual({
      colorNames: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456, #AFAFAF, #222')).toEqual({
      colorNames: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456, #AFAFAF, #2222222', '#ZZZZZZ')).toEqual({
      colorNames: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });

    // This should test order, as there is a candy cane in custom
    // and in the color-name-list and they have difference case.
    expect(textToColors('Candy CANE')).toEqual({
      colorNames: ['Candy cane'],
      colors: ['#FF0000', '#FFFFFF', '#00FF00']
    });

    // With numbers
    expect(textToColors('palette 1')).toEqual({
      colorNames: ['Palette 1'],
      colors: ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900']
    });
    expect(textToColors('palette 100')).toEqual({
      colorNames: ['Palette 100'],
      colors: ['#805841', '#DCF7F3', '#FFFCDD', '#FFD8D8', '#F5A2A2']
    });

    // Random
    expect(textToColors('random').colorNames.length).toEqual(1);
    expect(textToColors('random red blue').colorNames.length).toEqual(3);

    // Other cases
    expect(textToColors('blue green')).toEqual({
      colorNames: ['blue green'],
      colors: ['#0D98BA']
    });

    expect(textToColors('#123456 blue')).toEqual({
      colorNames: ['#123456', 'blue'],
      colors: ['#123456', '#0000FF']
    });

    expect(textToColors('this is some red here and then blue here')).toEqual({
      colorNames: ['red', 'blue'],
      colors: ['#FF0000', '#0000FF']
    });

    expect(textToColors('bright green and green')).toEqual({
      colorNames: ['bright green', 'green'],
      colors: ['#66FF00', '#00FF00']
    });

    expect(textToColors('bright, bright green and strawberry')).toEqual({
      colorNames: ['Brig', 'bright green', 'strawberry'],
      colors: ['#4FA1C0', '#66FF00', '#FC5A8D']
    });

    expect(textToColors('go #france!')).toEqual({
      colorNames: ['France'],
      colors: ['#ED2939', '#FFFFFF', '#002395']
    });
  });
});
