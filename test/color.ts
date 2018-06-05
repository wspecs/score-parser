import * as color from '../lib/color';
import { expect } from 'chai';

describe('color', () => {
  it('passes foreground test', () => {
      expect(color.passForegroudTest(0, 0, 0, 0.5)).to.equal(false);
      expect(color.passForegroudTest(10, 10, 10, 0.5)).to.equal(false);
      expect(color.passForegroudTest(200, 255, 155, 0.5)).to.equal(true);
      expect(color.passForegroudTest(255, 255, 255, 0.5)).to.equal(true);
  });
});
