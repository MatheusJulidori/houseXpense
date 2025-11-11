export enum MovementType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export const isValidMovementType = (value: unknown): value is MovementType => {
  if (typeof value !== 'string') {
    return false;
  }

  const candidate = value as MovementType;
  return (
    candidate === MovementType.INCOME || candidate === MovementType.EXPENSE
  );
};
