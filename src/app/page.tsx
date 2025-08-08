import {
  Avatar,
  Button,
  Card,
  Input,
  InputGroup,
  Textarea,
} from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Plus } from "lucide-react";
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
      <Button
        bg="#4338CA"
        css={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
        }}
      >
        <Plus color="white" />
      </Button>
      <Card.Root width="320px">
        <Card.Body gap="2">
          <Card.Title mt="2">メモタイトル</Card.Title>
          <Card.Description>メモの内容を入力してください。</Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-end"></Card.Footer>
      </Card.Root>
    </div>
  );
}
