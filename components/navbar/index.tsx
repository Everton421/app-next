 import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image"
import { useContext } from "react";
import { Button } from "../ui/button";

export default   function Navbar  () {

  const { logout }:any = useAuth();

  return (
    <nav className=" w-auto bg-[#185FED] sm:ml-14  flex justify-between  print:hidden  ">
      <div className=" bg-white rounded-full m-1 ">
           <Image 
             
                src="/images/icon.png"
                alt="img"
                width={80}
                height={80}
            />
        </div>
      

      {/* <span className="text-white  font-sans font-bold text-3xl -left-20 ">
        { nomeEmpresa } 
      </span>
  */}
      <Button className="bg-white m-7 text-black" onClick={()=> logout()}>
        Sair
      </Button>
    </nav>
    )
}