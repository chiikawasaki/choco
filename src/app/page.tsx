import { Button, Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <Button colorScheme="blue">Button</Button>
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "10px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <InputGroup
        endElement={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Search />
            <SlidersHorizontal />
          </div>
        }
      >
        <Input
          placeholder="キーワードを入力"
          size="sm"
          color="white"
          css={{ borderRadius: "30px" }}
        />
      </InputGroup>
    </div>
  );
}
