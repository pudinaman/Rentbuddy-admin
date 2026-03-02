import ReactDOM from "react-dom";
import { ReactNode } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

function ModalWrapper({ isOpen, onClose, children }: ModalWrapperProps) {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100000] overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-[350px] sm:w-[450px] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button className="absolute top-3 right-3 ..." onClick={onClose}>✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
}
export default ModalWrapper;