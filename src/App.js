import {
  ChakraProvider,
  Heading,
  Container,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Image,
  Link,
  SkeletonCircle,
  SkeletonText,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Flex,
  Textarea
} from "@chakra-ui/react";
import { useState } from "react";
import {
  getImage, 
  getSamplers, 
  getModels, 
  changeModel
} from "./api"

const App = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negPrompt, updateNegPrompt] = useState("");
  const [loading, updateLoading] = useState(false);

  const [showAdvancedSettings, updateShowAdvancedSettings] = useState(false);
  const [samplers, updateSamplers] = useState([])
  const [models, updateModels] = useState([])
  const [currentModel, updateCurrentModel] = useState("")

  const [advancedSettings, updateAdvancedSettings] = useState({
    //default: model: "mdjrny-v4",
    samplingMethod: "",
    steps: 40,
    width: 512,
    height: 768,
    cfgScale: 6.0,
  });

  const generate = async (prompt, negativePrompt, advancedSettings) => {
    console.log(advancedSettings)
    updateLoading(true);
    const data = {
      prompt: prompt,
      negative_prompt: negativePrompt,
      ...advancedSettings
    }
    const imageData = await getImage(data, 'http://127.0.0.1:7860/sdapi/v1/txt2img');
    updateImage(imageData.images[0]);
    updateLoading(false);
  };

  const handleAdvancedSettingsChange = (e) => {
    const { name, value } = e.target;
    updateAdvancedSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleModelChange = async (e, model) => {
    let value;
    if (e && e.target) {
      value = e.target.value;
    } else {
      value = model
    }

    console.log('Current model: ' + value)
    updateCurrentModel(value)
    //call api to reload that model
    await changeModel(value, 'http://127.0.0.1:7860/sdapi/v1/reload-model')
  };

  return (
    <ChakraProvider>
      <Container>
        <Heading>Stable DIffusion🚀</Heading>
        <Text marginBottom={"10px"}>
          This react application leverages the model trained by Stability AI and
          Runway ML to generate images using the Stable Diffusion Deep Learning
          model. The model can be found via github here{" "}
          <Link href={"https://github.com/CompVis/stable-diffusion"}>
            Github Repo
          </Link>
        </Text>

        <Wrap marginBottom={"10px"}>
          <Input
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            width={"350px"}
            placeholder="Prompt"
          ></Input>
          <Input
            value={negPrompt}
            onChange={(e) => updateNegPrompt(e.target.value)}
            width={"350px"}
            placeholder="Negative Prompt"
          ></Input>
          <Button onClick={(e) => generate(prompt, negPrompt, advancedSettings)} colorScheme={"yellow"}>
            Generate
          </Button>
        </Wrap>

        <Flex alignItems="center" marginBottom="10px">
          <Text marginRight="10px" fontWeight="bold">
            Advanced Settings
          </Text>
          <Switch
            colorScheme="teal"
            isChecked={showAdvancedSettings}
            onChange={async () => {
              updateShowAdvancedSettings(!showAdvancedSettings);
              if (samplers.length === 0) {
                const list_samplers = await getSamplers('http://127.0.0.1:7860/sdapi/v1/samplers');
                const list_models = await getModels('http://127.0.0.1:7860/sdapi/v1/sd-models');
                updateSamplers(list_samplers);
                updateModels(list_models)
                handleModelChange(null, list_models[0].model_name)
                updateAdvancedSettings((prevSettings) => ({
                  ...prevSettings,
                  samplingMethod: list_samplers[0].name,
                }));

              }
            }}
          />
        </Flex>
        {showAdvancedSettings && (
          <>
            <Flex alignItems="center" marginBottom="10px">
              <FormControl marginBottom={"10px"} marginRight={"10px"}>
                <FormLabel>Model</FormLabel>
                <Select
                  name="model"
                  value={currentModel}
                  onChange={handleModelChange}
                  width={"250px"}
                >
                  {models.map((model) => (
                    <option key={model.model_name} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>Sampling Method</FormLabel>
                <Select
                  name="samplingMethod"
                  value={advancedSettings.samplingMethod}
                  onChange={handleAdvancedSettingsChange}
                  width={"200px"}
                >
                  {samplers.map((method) => (
                    <option key={method.name} value={method.name}>
                      {method.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl marginBottom={"10px"}>
                <FormLabel>Steps</FormLabel>
                <Input
                  name="steps"
                  value={advancedSettings.steps}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Steps"
                  width={"100px"}
                />
              </FormControl>
            </Flex>

            <Flex alignItems="center" marginBottom="10px">

              <FormControl marginBottom={"10px"}>
                <FormLabel>Width</FormLabel>
                <Input
                  name="width"
                  value={advancedSettings.width}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Width"
                  width={"100px"}
                />
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>Height</FormLabel>
                <Input
                  name="height"
                  value={advancedSettings.height}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Height"
                  width={"100px"}
                />
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>CFG Scale</FormLabel>
                <Input
                  name="cfgScale"
                  value={advancedSettings.cfgScale}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="CFG Scale"
                  width={"100px"}
                />
              </FormControl>
            </Flex>
          </>
        )}

        {loading ? (
          <Stack>
            <SkeletonCircle />
            <SkeletonText />
          </Stack>
        ) : image ? (
          <Flex>
            <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
            <Textarea
              value="{textValue}"
              isReadOnly
              ml={1}
              placeholder="Image Title"
            />
          </Flex>

        ) : null}
      </Container>
    </ChakraProvider>);
};

export default App;