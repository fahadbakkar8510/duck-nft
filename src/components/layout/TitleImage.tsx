import useMachineStore from '../../store';
import logo from '../../assets/img/logo-base.png';

const TitleImage = () => {
  const { openBurnForm } = useMachineStore();
  return (
    <img
      className="
        z-50 absolute
        w-[55%] lg:w-[50%] 2xl:w-[45%]
        left-[12%] -top-[4%] 2xl:top-[1%]
      "
      src={logo}
      alt="Tozzi Ducks"
    />
  );
};

export default TitleImage;
