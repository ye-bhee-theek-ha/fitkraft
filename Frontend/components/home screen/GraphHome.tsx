import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
        
const Graph = () => {
  const data = [
    {value: 2500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Jan'},
    {value: 2400, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 3500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Feb'},
    {value: 3000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 4500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Mar'},
    {value: 4000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 5200, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Apr'},
    {value: 4900, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 3000, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'May'},
    {value: 2800, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
  ];

  return(
    <View
      style={{
        margin: 10,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#232B5D',
      }}>
      <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
        Overview
      </Text>
      <View style={{padding: 20, alignItems: 'center'}}>
        
      </View>
    </View>
    );
  };
  
  export default Graph;