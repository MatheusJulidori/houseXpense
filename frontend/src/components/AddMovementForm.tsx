import { memo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Spinner } from './ui/spinner';
import { Tag, Plus, Minus } from 'lucide-react';
import { useTags, useCreateTag } from '../hooks/useTags';
import { useCreateMovement } from '../hooks/useMovements';
import type { CreateMovementRequest, MovementType } from '../types/movement.types';

interface AddMovementFormProps {
    isOpen: boolean;
    onClose: () => void;
}

function AddMovementFormComponent({ isOpen, onClose }: AddMovementFormProps) {
    const [formData, setFormData] = useState<CreateMovementRequest>({
        description: '',
        type: 'INCOME',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
    });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: tags = [], isLoading: tagsLoading } = useTags();
    const createTagMutation = useCreateTag();
    const createMovementMutation = useCreateMovement();

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                description: '',
                type: 'INCOME',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
            });
            setSelectedTags([]);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            setError('Descrição é obrigatória');
            return;
        }
        if (formData.amount === 0) {
            setError('Valor deve ser diferente de zero');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Convert tag IDs to tag names for the API
            const tagNames = selectedTags
                .map(id => tags.find(t => t.id === id)?.name)
                .filter((name): name is string => !!name);
            await createMovementMutation.mutateAsync({
                ...formData,
                amount: Math.abs(formData.amount),
                tags: tagNames,
            });
            onClose();
        } catch (err) {
            setError('Erro ao criar movimentação. Tente novamente.');
            console.error('Error creating movement:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleTagToggle = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(prev => prev.filter(id => id !== tagId));
        } else {
            setSelectedTags(prev => [...prev, tagId]);
        }
    };

    const [newTagName, setNewTagName] = useState('');

    const handleCreateTag = async () => {
        const name = newTagName.trim().toLowerCase();
        if (!name) return;
        try {
            const created = await createTagMutation.mutateAsync({ name });
            setNewTagName('');
            // auto-select the newly created tag
            setSelectedTags(prev => [...prev, created.id]);
        } catch (e) {
            // swallow; service throws ConflictException if exists
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setFormData(prev => ({
            ...prev,
            amount: value,
        }));
    };

    const isIncome = formData.type === 'INCOME';
    const isExpense = formData.type === 'EXPENSE';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Movimentação</DialogTitle>
                    <DialogDescription>
                        Adicione uma nova movimentação financeira
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Ex: Salário, Aluguel, Compras..."
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: MovementType) => setFormData(prev => ({ ...prev, type: value }))}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Receita</SelectItem>
                                <SelectItem value="EXPENSE">Despesa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor *</Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount || ''}
                                onChange={handleAmountChange}
                                placeholder="0.00"
                                required
                                disabled={isSubmitting}
                                className="pr-8"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isIncome && <Plus className="h-4 w-4 text-success" />}
                                {isExpense && <Minus className="h-4 w-4 text-destructive" />}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Digite o valor da movimentação
                        </p>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tags
                        </Label>
                        {/* Create new tag inline */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Criar nova tag"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                disabled={tagsLoading || isSubmitting || createTagMutation.isPending}
                            />
                            <Button type="button" variant="outline" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                                Adicionar
                            </Button>
                        </div>
                        {tagsLoading ? (
                            <div className="flex gap-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                                        onClick={() => handleTagToggle(tag.id)}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {selectedTags.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selecionada{selectedTags.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.description.trim() || formData.amount === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Movimentação'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default memo(AddMovementFormComponent);
