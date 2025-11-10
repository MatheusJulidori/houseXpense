import { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Edit, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Movement } from '../types/movement.types';

interface MovementsTableProps {
    movements: Movement[];
    isLoading: boolean;
    onEdit: (movement: Movement) => void;
    onDelete: (movement: Movement) => void;
    onAdd: () => void;
}

function MovementsTableComponent({
    movements,
    isLoading,
    onEdit,
    onDelete,
    onAdd
}: MovementsTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Movimentações</h2>
                    <Button onClick={onAdd} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    if (movements.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Movimentações</h2>
                    <Button onClick={onAdd} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                <div className="border rounded-lg p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                        <Plus className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
                        <p className="text-sm">Comece adicionando sua primeira movimentação</p>
                    </div>
                    <Button onClick={onAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Movimentação
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Movimentações ({movements.length})
                </h2>
                <Button onClick={onAdd} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.map((movement) => (
                            <TableRow key={movement.id}>
                                <TableCell className="font-medium">
                                    {formatDate(movement.date)}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {movement.description}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {movement.type === 'INCOME' ? (
                                            <Plus className="h-4 w-4 text-success" />
                                        ) : (
                                            <Minus className="h-4 w-4 text-destructive" />
                                        )}
                                        <span className={movement.type === 'INCOME' ? 'income-text' : 'expense-text'}>
                                            {formatCurrency(Number(movement.amount))}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {movement.tags?.sort((a, b) => a.name.localeCompare(b.name)).map((tag) => (
                                            <Badge key={tag.id} variant="secondary" className="text-xs">
                                                {tag.name}
                                            </Badge>
                                        )) || (
                                                <span className="text-muted-foreground text-sm">Sem tags</span>
                                            )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(movement)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(movement)}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default memo(MovementsTableComponent);
