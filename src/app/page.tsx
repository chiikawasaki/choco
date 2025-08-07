import { Button } from "@chakra-ui/react";
import { AlignJustify } from "lucide-react";

export default function Home() {
  return (
    <div>
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
         <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "10px", padding: "15px 25px" }}
      >
        保存する
      </Button>

    </div>
  );
}
