import { Contact, Terminal } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { redirect, useRouter } from "next/navigation"
 
 
 
export function AlertDemo({ title, content , visible, setVisible , to }:any ) {
  const router = useRouter();

    function handleClick(){
      setVisible(false)
      if( to !== null || to !== '' ){
       router.push(to)
      }

  }


  return (

    <AlertDialog open={visible} >
    
    <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle > {title} </AlertDialogTitle>
          <AlertDialogDescription  >
              {content}
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
          <AlertDialogCancel onClick={()=> handleClick()} >Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={()=> handleClick()} >ok</AlertDialogAction>
          </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
  )
}