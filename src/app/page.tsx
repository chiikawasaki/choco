import { Button } from "@chakra-ui/react";

export default function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <Button colorScheme="blue">Button</Button>
      <Button size="sm" variant="subtle" bg="#4338CA" color="white" 
      css={{borderRadius:"30px",margin:"10px",padding:"15px 25px"}}>保存する</Button>
    </div>
  );
}
