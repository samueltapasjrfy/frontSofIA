import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ModalViewTextProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

const ModalViewText = ({ isOpen, onClose, text }: ModalViewTextProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Texto da Publicação</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-gray-700 whitespace-pre-wrap max-h-[80vh] overflow-y-auto">
          {text}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewText;