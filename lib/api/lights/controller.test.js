// To test
import { textToColors } from './controller.js';

// Test textToColors
describe('textToColors', () => {
  test('can convert colors as expected', () => {
    // Single color
    expect(textToColors('red')).toEqual({
      sanitized: ['red'],
      colors: ['#FF0000']
    });
    expect(textToColors('xmas')).toEqual({
      sanitized: ['Xmas'],
      colors: ['#FF0000', '#FFFFFF', '#00FF00']
    });

    // Comma color
    expect(textToColors('red, green')).toEqual({
      sanitized: ['red', 'green'],
      colors: ['#FF0000', '#00FF00']
    });
    expect(textToColors('blue, green')).toEqual({
      sanitized: ['blue', 'green'],
      colors: ['#0000FF', '#00FF00']
    });

    // Hex colors
    expect(textToColors('#123456, #AFAFAF, #222222')).toEqual({
      sanitized: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456 #AFAFAF #222222')).toEqual({
      sanitized: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456, #AFAFAF, #222')).toEqual({
      sanitized: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });
    expect(textToColors('#123456, #AFAFAF, #2222222', '#ZZZZZZ')).toEqual({
      sanitized: ['#123456', '#AFAFAF', '#222222'],
      colors: ['#123456', '#AFAFAF', '#222222']
    });

    // Other cases
    expect(textToColors('blue green')).toEqual({
      sanitized: ['blue green'],
      colors: ['#0D98BA']
    });

    expect(textToColors('#123456 blue')).toEqual({
      sanitized: ['#123456', 'blue'],
      colors: ['#123456', '#0000FF']
    });

    expect(textToColors('this is some red here and then blue here')).toEqual({
      sanitized: ['red', 'blue'],
      colors: ['#FF0000', '#0000FF']
    });

    expect(textToColors('bright green and green')).toEqual({
      sanitized: ['bright green', 'green'],
      colors: ['#66FF00', '#00FF00']
    });

    expect(textToColors('bright, bright green and strawberry')).toEqual({
      sanitized: ['bright green', 'strawberry'],
      colors: ['#66FF00', '#FC5A8D']
    });

    expect(textToColors('go #france!')).toEqual({
      sanitized: ['France'],
      colors: ['#ED2939', '#FFFFFF', '#002395']
    });
  });
});
