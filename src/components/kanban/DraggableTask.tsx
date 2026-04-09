import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableTaskProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableTask = ({
  id,
  children,
  className,
}: DraggableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={className}
    >
      {children}
    </div>
  );
};
