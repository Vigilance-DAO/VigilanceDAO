import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Swiper styles
import { Navigation, Pagination } from "swiper/modules";
import { Box, HStack, Image, Stack, Text, VStack } from "@chakra-ui/react";
import { testimonials } from "utils/testimonials";

function Testimonials() {
  return (
    <Box
      width={{ base: "90%", md: "80%" }}
      color="white"
      padding={{ md: "4rem", xl: "2rem" }}
      paddingTop="2rem"
      bgGradient="linear(to-br,#5400CD,#121442,#121442,#121442,#121442,#121442)"
      borderRadius="1rem"
      marginY="8rem"
    >
      <Text
        fontSize={{ base: "2rem", md: "4rem" }}
        marginBottom={{ base: "1rem", md: "2rem" }}
      >
        Voices of Web3 Users
      </Text>
      <Swiper
        navigation={true}
        pagination={true}
        modules={[Pagination, Navigation]}
        style={{ padding: "1rem" }}
      >
        {testimonials.map(({ name, comment, image, post }, index) => {
          return (
            <SwiperSlide
              style={{
                backgroundColor: "transparent",
                height: "100%",
                display: "flex",
                justifyContent: "center",
              }}
              key={index}
            >
              <Stack
                direction={{ base: "column", xl: "row" }}
                width="90%"
                alignItems="center"
                paddingY="2rem"
                paddingX={{ base: "1rem", md: "3.5rem" }}
                spacing={{ base: "3rem", md: "5rem" }}
              >
                <Image
                  bg="#5400CD"
                  src={image}
                  alt={`Image of ${name}`}
                  width={{ base: "80%", xl: "30%" }}
                  borderRadius="full"
                />
                <VStack
                  width={{ base: "100%", xl: "70%" }}
                  spacing="1rem"
                  alignItems="start"
                  justifyContent="center"
                >
                  <Text
                    as="i"
                    fontSize={{ base: "1rem", md: "1.8rem" }}
                    lineHeight="none"
                    textAlign={{ base: "center", xl: "left" }}
                    paddingBottom="1rem"
                    fontWeight="bold"
                    color="purple.400"
                  >
                    {comment}
                  </Text>
                  <HStack
                    alignItems="baseline"
                    justify={{ base: "center", xl: "start" }}
                    width="100%"
                  >
                    <Text
                      fontSize={{ base: "1.2rem", md: "1.4rem" }}
                      // textAlign={{ base: "center", xl: "left" }}
                      opacity="0.9"
                      fontWeight="600"
                      as="span"
                    >
                      {name}
                    </Text>
                    <Text
                      fontSize={{ base: "1rem", md: "1.2rem" }}
                      textAlign="left"
                      opacity="0.8"
                      fontWeight="400"
                      as="span"
                    >
                      {post}
                    </Text>
                  </HStack>
                </VStack>
              </Stack>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
}

export default Testimonials;
