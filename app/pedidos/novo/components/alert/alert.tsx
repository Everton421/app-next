import { Contact, Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 
export function AlertDemo({ variant,  className, content, title}:any ) {
  return (

    <Alert variant={  variant } className={className}>

      <Terminal  />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
            {content}        
      </AlertDescription>
    </Alert>
  )
}