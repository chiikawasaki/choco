import { Box, Button } from "@chakra-ui/react";

const Postpage = () => {
  return (
    <Box position="relative" height="100vh" bg="#f0f0f0">
      <Button
        position="fixed"
        top="8px"
        right="16px"
        bg="#4338CA"
        color="white"
        borderRadius="30px"
        padding="15px 25px"
        zIndex="1000"
      >
        保存
      </Button>
    </Box>
  );
};

export default Postpage;
