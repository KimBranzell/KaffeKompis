import { render, fireEvent } from '@testing-library/svelte';
import FourSixGenerator from '../4-6-generator.svelte';

describe('FourSixGenerator', () => {
  test('renders without errors', () => {
    const { getByText } = render(FourSixGenerator);
    expect(getByText('Kaffevikt (gram)')).toBeInTheDocument();
  });

  test('calculates water weight correctly', () => {
    const { component } = render(FourSixGenerator);
    component.$set({ coffeeWeightGrams: 20, waterToCoffeeRatio: 15 });
    expect(component.waterWeight).toBe(300);
  });

  test('calculates first and second pours correctly for acidic taste', () => {
    const { component } = render(FourSixGenerator);
    const [firstPour, secondPour] = component.calculateFirstAndSecondPours('Acidic', 100);
    expect(firstPour).toBe(66.67);
    expect(secondPour).toBe(33.33);
  });

  test('calculates first and second pours correctly for balanced taste', () => {
    const { component } = render(FourSixGenerator);
    const [firstPour, secondPour] = component.calculateFirstAndSecondPours('Balanced', 100);
    expect(firstPour).toBe(50);
    expect(secondPour).toBe(50);
  });

  test('calculates first and second pours correctly for sweet taste', () => {
    const { component } = render(FourSixGenerator);
    const [firstPour, secondPour] = component.calculateFirstAndSecondPours('Sweet', 100);
    expect(firstPour).toBe(33.33);
    expect(secondPour).toBe(66.67);
  });

  test('calculates subsequent pours correctly for strong coffee', () => {
    const { component } = render(FourSixGenerator);
    const subsequentPours = component.calculateSubsequentPours('Strong', 100);
    expect(subsequentPours).toEqual([25, 25, 25, 25]);
  });

  test('calculates subsequent pours correctly for balanced coffee', () => {
    const { component } = render(FourSixGenerator);
    const subsequentPours = component.calculateSubsequentPours('Balanced', 100);
    expect(subsequentPours).toEqual([33.33, 33.33, 33.33]);
  });

  test('calculates subsequent pours correctly for weak coffee', () => {
    const { component } = render(FourSixGenerator);
    const subsequentPours = component.calculateSubsequentPours('Weak', 100);
    expect(subsequentPours).toEqual([50, 50]);
  });

  test('updates brewing temperature correctly for light roast', async () => {
    const { component } = render(FourSixGenerator);
    component.$set({ roastGrade: 'Light' });
    await component.$$.updateComplete;
    expect(component.brewingTemperature).toBe(93);
  });

  test('updates brewing temperature correctly for medium roast', async () => {
    const { component } = render(FourSixGenerator);
    component.$set({ roastGrade: 'Medium' });
    await component.$$.updateComplete;
    expect(component.brewingTemperature).toBe(88);
  });

  test('updates brewing temperature correctly for dark roast', async () => {
    const { component } = render(FourSixGenerator);
    component.$set({ roastGrade: 'Dark' });
    await component.$$.updateComplete;
    expect(component.brewingTemperature).toBe(83);
  });

  test('starts preparation timer when "Börja brygga" button is clicked', async () => {
    const { component, getByText } = render(FourSixGenerator);
    const startButton = getByText('Börja brygga');
    fireEvent.click(startButton);
    await component.$$.updateComplete;
    expect(component.isPrepping).toBe(true);
  });

  test('starts brewing timer after preparation timer completes', async () => {
    const { component } = render(FourSixGenerator);
    component.startPrepTimer();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(component.isBrewing).toBe(true);
  });
});
