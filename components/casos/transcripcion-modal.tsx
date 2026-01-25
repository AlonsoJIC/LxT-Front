import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TranscripcionModalProps {
  open: boolean;
  onClose: () => void;
  transcripcion: string | null;
}

const TranscripcionModal: React.FC<TranscripcionModalProps> = ({ open, onClose, transcripcion }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transcripción</DialogTitle>
          <DialogDescription>
            Vista de la transcripción del audio seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {transcripcion}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranscripcionModal;
