import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFormStore } from "@/lib/store/formStore";
import { useInterviewStore } from "@/lib/store/interviewStore";
import { useRouter } from "next/navigation";

interface Props {
  openDialogue: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ConfirmDialog({ openDialogue, setOpenDialog }: Props) {
  const router = useRouter();
  const { resetForm: resetInterviewSetup } = useFormStore();
  const { resetStore: resetInterviewStore, stopSpeaking } = useInterviewStore();

  const startNewInterview = async () => {
    stopSpeaking();
    resetInterviewStore();
    resetInterviewSetup();
    router.replace("/");
  };
  return (
    <AlertDialog open={openDialogue} onOpenChange={() => setOpenDialog(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Your interview session isn&apos;t finished yet. Leaving now will
            erase your progress. Are you sure you want to go back?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Stay on page
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={startNewInterview}
            className="cursor-pointer"
          >
            Leave page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
