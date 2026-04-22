import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Switch,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

type GoalType = "maintain" | "deficit" | "bulk";
type MealType = "Pre Workout" | "Post Workout" | "Lunch" | "Evening Snacks" | "Dinner";

type FoodItem = {
  name: string;
  type: "veg" | "non-veg";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
};

const FOOD_CATALOG: FoodItem[] = [
  { name: "Oats + Banana", type: "veg", calories: 280, protein: 10, carbs: 52, fat: 4, meal: "Pre Workout" },
  { name: "Paneer Wrap", type: "veg", calories: 330, protein: 23, carbs: 30, fat: 13, meal: "Post Workout" },
  { name: "Dal + Brown Rice", type: "veg", calories: 420, protein: 18, carbs: 66, fat: 8, meal: "Lunch" },
  { name: "Roasted Chana + Fruit", type: "veg", calories: 210, protein: 9, carbs: 35, fat: 3, meal: "Evening Snacks" },
  { name: "Tofu Stir Fry + Quinoa", type: "veg", calories: 390, protein: 26, carbs: 42, fat: 12, meal: "Dinner" },
  { name: "Chicken + Sweet Potato", type: "non-veg", calories: 350, protein: 34, carbs: 35, fat: 8, meal: "Post Workout" },
  { name: "Egg Whites + Toast", type: "non-veg", calories: 250, protein: 24, carbs: 20, fat: 7, meal: "Pre Workout" },
  { name: "Grilled Fish + Rice", type: "non-veg", calories: 430, protein: 36, carbs: 48, fat: 10, meal: "Lunch" },
  { name: "Greek Yogurt + Nuts", type: "non-veg", calories: 220, protein: 18, carbs: 12, fat: 11, meal: "Evening Snacks" },
  { name: "Turkey Salad Bowl", type: "non-veg", calories: 360, protein: 33, carbs: 24, fat: 13, meal: "Dinner" },
];

const MEAL_ORDER: MealType[] = ["Pre Workout", "Post Workout", "Lunch", "Evening Snacks", "Dinner"];

const GOAL_FACTORS: Record<GoalType, number> = {
  maintain: 1,
  deficit: 0.85,
  bulk: 1.15,
};

const estimateCalories = (gender: string, age: number, bodyFat: number) => {
  const leanMass = Math.max(30, 70 - bodyFat * 0.5);
  const base = gender === "female" ? leanMass * 20 : leanMass * 22;
  const ageAdjustment = age > 40 ? -150 : age < 25 ? 100 : 0;

  return Math.round(base + 900 + ageAdjustment);
};

const DietPlannerPage = () => {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(28);
  const [bodyFat, setBodyFat] = useState(20);
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [preferVeg, setPreferVeg] = useState(false);
  const [voiceGoal, setVoiceGoal] = useState("");
  const [weeklyTracking, setWeeklyTracking] = useState([true, true, false, true, false, false, true]);

  const targetCalories = useMemo(() => {
    const maintenance = estimateCalories(gender, age, bodyFat);
    return Math.round(maintenance * GOAL_FACTORS[goal]);
  }, [gender, age, bodyFat, goal]);

  const mealPlan = useMemo(() => {
    const filtered = FOOD_CATALOG.filter((item) => (preferVeg ? item.type === "veg" : true));

    return MEAL_ORDER.map((meal) => {
      const options = filtered.filter((item) => item.meal === meal);
      return options[0] ?? FOOD_CATALOG.find((item) => item.meal === meal)!;
    });
  }, [preferVeg]);

  const mealTotals = useMemo(
    () =>
      mealPlan.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [mealPlan]
  );

  const handleVoiceCapture = () => {
    const Win = window as any;
    const SpeechRecognition = Win.SpeechRecognition || Win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceGoal("Voice input is not supported in this browser. Please type your goal manually.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setVoiceGoal(transcript);

      const normalized = transcript.toLowerCase();
      if (normalized.includes("bulk")) setGoal("bulk");
      else if (normalized.includes("deficit") || normalized.includes("cut")) setGoal("deficit");
      else if (normalized.includes("maintain")) setGoal("maintain");
    };

    recognition.start();
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Stack spacing={6} maxW="1200px" mx="auto">
        <Box>
          <Heading size="lg">Daily Diet Planner</Heading>
          <Text color="gray.600" mt={2}>
            Build your daily meal plan using gender, age, body fat and your spoken fitness goal.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr" }} gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="md">Profile & Goal</Heading>
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Age</FormLabel>
                    <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Body Fat %</FormLabel>
                    <Input type="number" value={bodyFat} onChange={(e) => setBodyFat(Number(e.target.value) || 0)} />
                  </FormControl>

                  <Flex align="center" justify="space-between">
                    <Text fontWeight="medium">Veg only plan</Text>
                    <Switch isChecked={preferVeg} onChange={(e) => setPreferVeg(e.target.checked)} />
                  </Flex>

                  <FormControl>
                    <FormLabel>Goal (voice or manual)</FormLabel>
                    <Select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
                      <option value="maintain">Maintain calories</option>
                      <option value="deficit">Calorie deficit</option>
                      <option value="bulk">Bulking plan</option>
                    </Select>
                  </FormControl>

                  <Button colorScheme="teal" onClick={handleVoiceCapture}>
                    Speak Goal
                  </Button>
                  <Textarea value={voiceGoal} onChange={(e) => setVoiceGoal(e.target.value)} placeholder="Spoken goal transcript..." />
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <SimpleGrid columns={1} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Daily Target Calories</StatLabel>
                    <StatNumber>{targetCalories} kcal</StatNumber>
                    <StatHelpText>
                      Meal plan currently provides {mealTotals.calories} kcal
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="sm" mb={3}>Daily Macro Total</Heading>
                  <Text>Protein: {mealTotals.protein} g</Text>
                  <Text>Carbs: {mealTotals.carbs} g</Text>
                  <Text>Fat: {mealTotals.fat} g</Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </GridItem>
        </Grid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Recommended Meals</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {mealPlan.map((meal) => (
                <Box key={meal.meal} borderWidth="1px" borderRadius="lg" p={4} bg="white">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm">{meal.meal}</Heading>
                    <Badge colorScheme={meal.type === "veg" ? "green" : "orange"}>{meal.type}</Badge>
                  </Flex>
                  <Text fontWeight="semibold">{meal.name}</Text>
                  <Text fontSize="sm" color="gray.600">{meal.calories} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Weekly Target Tracking</Heading>
            <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
              {weeklyTracking.map((hit, index) => (
                <Button
                  key={index}
                  onClick={() =>
                    setWeeklyTracking((prev) => prev.map((value, i) => (i === index ? !value : value)))
                  }
                  colorScheme={hit ? "green" : "red"}
                  variant={hit ? "solid" : "outline"}
                >
                  Day {index + 1} {hit ? "✓" : "✗"}
                </Button>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
};

export default DietPlannerPage;
