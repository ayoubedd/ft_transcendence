import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user-dto';

@Injectable()
export class HasAtLeastOnePropertyPipe implements PipeTransform {
  transform(value: UpdateUserDto) {
    if (!this.hasAtLeastOneProperty(value))
      throw new BadRequestException('at least one property is required');
    return value;
  }

  hasAtLeastOneProperty(dto: UpdateUserDto) {
    let flag = false;
    Object.values(dto).every((el) => {
      if (el != undefined) {
        flag = true;
        return false;
      }
    });
    return flag;
  }
}
