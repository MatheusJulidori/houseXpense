import type {
    MovementFilters,
    MovementQueryParams,
    Movement,
    MovementType,
} from '../types/movement.types';

export const buildMovementQueryParams = (filters: MovementFilters): MovementQueryParams => {
    const params: MovementQueryParams = {};

    if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
    }

    if (filters.type) {
        params.type = filters.type;
    }

    if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0);
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
    } else if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
    }

    return params;
};

export const currentMonthFilters = (): MovementFilters => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    };
};

export const lastMonthsFilters = (months: number): MovementFilters => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

export const yearFilters = (year: number): MovementFilters => ({
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
});

export interface MovementStats {
    totalMovements: number;
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    averageIncome: number;
    averageExpense: number;
}

const sumByType = (movements: Movement[], type: MovementType): number =>
    movements
        .filter((movement) => movement.type === type)
        .reduce((sum, movement) => sum + Number(movement.amount), 0);

export const calculateMovementStats = (
    movements: Movement[] | undefined,
): MovementStats | null => {
    if (!movements) {
        return null;
    }

    const totalIncome = sumByType(movements, 'INCOME');
    const totalExpenses = sumByType(movements, 'EXPENSE');
    const incomeCount = movements.filter((movement) => movement.type === 'INCOME').length;
    const expenseCount = movements.filter((movement) => movement.type === 'EXPENSE').length;

    return {
        totalMovements: movements.length,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        averageIncome: incomeCount > 0 ? totalIncome / incomeCount : 0,
        averageExpense: expenseCount > 0 ? totalExpenses / expenseCount : 0,
    };
};


