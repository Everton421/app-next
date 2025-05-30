 import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image"
import { useContext } from "react";
import { Button } from "../ui/button";

export default   function Navbar  () {

  const { logout }:any = useAuth();

  return (
    <nav className=" w-auto bg-black sm:ml-14  flex justify-between  print:hidden  ">
         <Image 
          className="rounded-sm ml-1"
            src="/images/design.png"
            alt="img"
            width={100}
            height={100}
         />

      {/* <span className="text-white  font-sans font-bold text-3xl -left-20 ">
        { nomeEmpresa } 
      </span>
  */}
      <Button onClick={()=> logout()}>
        Logout
      </Button>
    </nav>
    )
}