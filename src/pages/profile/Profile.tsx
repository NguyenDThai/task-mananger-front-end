import { useSelector } from 'react-redux';
import { RenderProfile } from '../../components';
import type { RootState } from '../../redux/store';

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return <RenderProfile user={user} />;
};

export default ProfilePage;
