import { Contact, Terminal } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { redirect, useRouter } from "next/navigation"
 
 
 type props = {
  title:string 
  content :string
  visible :boolean
  setVisible:(values:boolean)=> void
  to?:string
  action?: ()=>void
 }
export function AlertDemo({ title, content , visible, setVisible , to , action }:props ) {
  const router = useRouter();

       
    function handleClick(){
      setVisible(false)
        if(action){
              action()
            }
      if(to &&  to !== undefined  ){
       router.push(String(to))
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